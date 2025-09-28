import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import UserStatusModel from "../models/user-status.model";
import ChannelMemberModel from "../models/channel-member.model";
import MessageModel from "../models/message.model";
import { config } from "../config/app.config";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

interface TypingData {
  channelId: string;
  workspaceId: string;
  userId: string;
  userName: string;
}

interface MessageData {
  channelId: string;
  workspaceId: string;
  content: string;
  replyToId?: string;
  mentions?: string[];
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private typingUsers: Map<string, Set<string>> = new Map(); // channelId -> userIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [config.FRONTEND_URL],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error("Authentication token required"));
        }

        // For session-based auth, you might need to verify session differently
        // This is a placeholder for JWT verification
        // In your case, you might want to check the session cookie instead
        
        const sessionId = socket.handshake.headers.cookie
          ?.split(';')
          .find(c => c.trim().startsWith('connect.sid='))
          ?.split('=')[1];

        if (!sessionId) {
          return next(new Error("Session required"));
        }

        // You would verify the session here with your session store
        // For now, we'll extract user info from the client
        const { userId, email, name } = socket.handshake.auth;
        
        if (!userId || !email || !name) {
          return next(new Error("User information required"));
        }

        socket.userId = userId;
        socket.userEmail = email;
        socket.userName = name;
        
        next();
      } catch (error) {
        next(new Error("Authentication failed"));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userName} connected with socket ${socket.id}`);
      
      this.handleUserConnection(socket);
      this.setupSocketEvents(socket);
    });
  }

  private async handleUserConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId;
    
    // Track connected socket
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)?.add(socket.id);

    // Join user to their workspace rooms
    socket.on("join_workspaces", async (workspaceIds: string[]) => {
      for (const workspaceId of workspaceIds) {
        socket.join(`workspace:${workspaceId}`);
        
        // Update user status to online
        await this.updateUserStatus(userId, workspaceId, 'online');
        
        // Notify others in workspace
        socket.to(`workspace:${workspaceId}`).emit("user:online", {
          userId,
          userName: socket.userName,
          status: 'online',
        });
      }
    });

    // Join user to their channels
    socket.on("join_channels", async (data: { workspaceId: string, channelIds: string[] }) => {
      const { workspaceId, channelIds } = data;
      
      for (const channelId of channelIds) {
        // Verify user is member of channel
        const membership = await ChannelMemberModel.findOne({
          channelId,
          userId,
          isActive: true,
        });

        if (membership) {
          socket.join(`channel:${channelId}`);
        }
      }
    });

    socket.on("disconnect", () => {
      this.handleUserDisconnection(socket);
    });
  }

  private setupSocketEvents(socket: AuthenticatedSocket) {
    // Typing indicators
    socket.on("typing:start", async (data: TypingData) => {
      await this.handleTypingStart(socket, data);
    });

    socket.on("typing:stop", async (data: TypingData) => {
      await this.handleTypingStop(socket, data);
    });

    // Real-time messaging
    socket.on("message:send", async (data: MessageData) => {
      await this.handleMessageSend(socket, data);
    });

    socket.on("message:edit", async (data: { messageId: string, content: string }) => {
      await this.handleMessageEdit(socket, data);
    });

    socket.on("message:delete", async (data: { messageId: string }) => {
      await this.handleMessageDelete(socket, data);
    });

    socket.on("reaction:add", async (data: { messageId: string, emoji: string }) => {
      await this.handleReactionAdd(socket, data);
    });

    // Status updates
    socket.on("status:update", async (data: { workspaceId: string, status: string, statusMessage?: string }) => {
      await this.handleStatusUpdate(socket, data);
    });
  }

  private async handleTypingStart(socket: AuthenticatedSocket, data: TypingData) {
    const { channelId, workspaceId, userId } = data;

    // Add user to typing set
    if (!this.typingUsers.has(channelId)) {
      this.typingUsers.set(channelId, new Set());
    }
    this.typingUsers.get(channelId)?.add(userId);

    // Update database
    await UserStatusModel.findOneAndUpdate(
      { userId, workspaceId },
      { 
        isTyping: true, 
        typingInChannel: channelId,
        lastSeenAt: new Date(),
      },
      { upsert: true }
    );

    // Notify others in channel
    socket.to(`channel:${channelId}`).emit("user:typing", {
      userId,
      userName: socket.userName,
      channelId,
      isTyping: true,
    });
  }

  private async handleTypingStop(socket: AuthenticatedSocket, data: TypingData) {
    const { channelId, workspaceId, userId } = data;

    // Remove user from typing set
    this.typingUsers.get(channelId)?.delete(userId);
    if (this.typingUsers.get(channelId)?.size === 0) {
      this.typingUsers.delete(channelId);
    }

    // Update database
    await UserStatusModel.findOneAndUpdate(
      { userId, workspaceId },
      { 
        isTyping: false, 
        typingInChannel: null,
        lastSeenAt: new Date(),
      }
    );

    // Notify others in channel
    socket.to(`channel:${channelId}`).emit("user:typing", {
      userId,
      userName: socket.userName,
      channelId,
      isTyping: false,
    });
  }

  private async handleMessageSend(socket: AuthenticatedSocket, data: MessageData) {
    try {
      const { channelId, workspaceId, content, replyToId, mentions } = data;
      const userId = socket.userId;

      // Verify user is member of channel
      const membership = await ChannelMemberModel.findOne({
        channelId,
        userId,
        isActive: true,
      });

      if (!membership) {
        socket.emit("error", { message: "You are not a member of this channel" });
        return;
      }

      // Create message
      const messageData: any = {
        content: content.trim(),
        channelId,
        senderId: userId,
        mentions: mentions || [],
      };

      if (replyToId) {
        messageData.replyToId = replyToId;
        // Update thread count for parent message
        await MessageModel.findByIdAndUpdate(replyToId, {
          $inc: { threadCount: 1 }
        });
      }

      const message = new MessageModel(messageData);
      await message.save();

      await message.populate([
        { path: 'senderId', select: 'name email avatar' },
        { path: 'replyToId', select: 'content senderId createdAt' },
      ]);

      // Update channel's last message timestamp
      const ChannelModel = (await import('../models/channel.model')).default;
      await ChannelModel.findByIdAndUpdate(channelId, {
        lastMessageAt: new Date(),
      });

      // Stop typing for this user
      await this.handleTypingStop(socket, { channelId, workspaceId, userId, userName: socket.userName });

      // Broadcast to all channel members
      this.io.to(`channel:${channelId}`).emit("message:new", {
        message: message.toObject(),
        channelId,
      });

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleMessageEdit(socket: AuthenticatedSocket, data: { messageId: string, content: string }) {
    try {
      const { messageId, content } = data;
      const userId = socket.userId;

      const message = await MessageModel.findById(messageId);

      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      if (message.senderId.toString() !== userId) {
        socket.emit("error", { message: "You can only edit your own messages" });
        return;
      }

      if (message.isDeleted) {
        socket.emit("error", { message: "Cannot edit deleted message" });
        return;
      }

      message.content = content.trim();
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      await message.populate([
        { path: 'senderId', select: 'name email avatar' },
        { path: 'replyToId', select: 'content senderId createdAt' },
      ]);

      // Broadcast to all channel members
      this.io.to(`channel:${message.channelId}`).emit("message:edit", {
        message: message.toObject(),
        channelId: message.channelId,
      });

    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("error", { message: "Failed to edit message" });
    }
  }

  private async handleMessageDelete(socket: AuthenticatedSocket, data: { messageId: string }) {
    try {
      const { messageId } = data;
      const userId = socket.userId;

      const message = await MessageModel.findById(messageId);

      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      if (message.senderId.toString() !== userId) {
        socket.emit("error", { message: "You can only delete your own messages" });
        return;
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      message.content = "[This message was deleted]";
      await message.save();

      // Broadcast to all channel members
      this.io.to(`channel:${message.channelId}`).emit("message:delete", {
        messageId,
        channelId: message.channelId,
      });

    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("error", { message: "Failed to delete message" });
    }
  }

  private async handleReactionAdd(socket: AuthenticatedSocket, data: { messageId: string, emoji: string }) {
    try {
      const { messageId, emoji } = data;
      const userId = socket.userId;

      const MessageReactionModel = (await import('../models/message-reaction.model')).default;
      
      // Check if reaction already exists
      const existingReaction = await MessageReactionModel.findOne({
        messageId,
        userId,
        emoji: emoji.trim(),
      });

      let reactionData;
      let removed = false;

      if (existingReaction) {
        // Remove reaction if it exists (toggle behavior)
        await MessageReactionModel.findByIdAndDelete(existingReaction._id);
        removed = true;
        reactionData = existingReaction;
      } else {
        // Add new reaction
        const reaction = new MessageReactionModel({
          messageId,
          userId,
          emoji: emoji.trim(),
        });
        await reaction.save();
        await reaction.populate('userId', 'name email avatar');
        reactionData = reaction;
      }

      const message = await MessageModel.findById(messageId);
      if (message) {
        // Broadcast to all channel members
        this.io.to(`channel:${message.channelId}`).emit("reaction:add", {
          messageId,
          reaction: reactionData,
          removed,
          channelId: message.channelId,
        });
      }

    } catch (error) {
      console.error("Error adding reaction:", error);
      socket.emit("error", { message: "Failed to add reaction" });
    }
  }

  private async handleStatusUpdate(socket: AuthenticatedSocket, data: { workspaceId: string, status: string, statusMessage?: string }) {
    try {
      const { workspaceId, status, statusMessage } = data;
      const userId = socket.userId;

      await this.updateUserStatus(userId, workspaceId, status as any, statusMessage);

      // Broadcast to workspace
      socket.to(`workspace:${workspaceId}`).emit("user:status_update", {
        userId,
        userName: socket.userName,
        status,
        statusMessage,
        lastSeenAt: new Date(),
      });

    } catch (error) {
      console.error("Error updating status:", error);
      socket.emit("error", { message: "Failed to update status" });
    }
  }

  private async handleUserDisconnection(socket: AuthenticatedSocket) {
    const userId = socket.userId;
    
    console.log(`User ${socket.userName} disconnected from socket ${socket.id}`);

    // Remove socket from connected users
    this.connectedUsers.get(userId)?.delete(socket.id);
    
    // If no more sockets for this user, mark as offline
    if (this.connectedUsers.get(userId)?.size === 0) {
      this.connectedUsers.delete(userId);

      // Update status to offline for all workspaces
      await UserStatusModel.updateMany(
        { userId },
        { 
          status: 'offline',
          isTyping: false,
          typingInChannel: null,
          lastSeenAt: new Date(),
        }
      );

      // Broadcast offline status to all workspaces
      // You might want to get user's workspaces and broadcast to each one
    }

    // Remove from typing indicators
    for (const [channelId, typingSet] of this.typingUsers.entries()) {
      if (typingSet.has(userId)) {
        typingSet.delete(userId);
        if (typingSet.size === 0) {
          this.typingUsers.delete(channelId);
        }

        // Notify channel that user stopped typing
        socket.to(`channel:${channelId}`).emit("user:typing", {
          userId,
          userName: socket.userName,
          channelId,
          isTyping: false,
        });
      }
    }
  }

  private async updateUserStatus(userId: string, workspaceId: string, status: 'online' | 'offline' | 'away' | 'busy', statusMessage?: string) {
    await UserStatusModel.findOneAndUpdate(
      { userId, workspaceId },
      { 
        status,
        lastSeenAt: new Date(),
        ...(statusMessage !== undefined && { statusMessage }),
      },
      { upsert: true }
    );
  }

  // Public method to get socket instance for external use
  public getIO(): SocketIOServer {
    return this.io;
  }

  // Method to emit to specific channel
  public emitToChannel(channelId: string, event: string, data: any) {
    this.io.to(`channel:${channelId}`).emit(event, data);
  }

  // Method to emit to specific workspace
  public emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.io.to(`workspace:${workspaceId}`).emit(event, data);
  }
}

export default SocketService;