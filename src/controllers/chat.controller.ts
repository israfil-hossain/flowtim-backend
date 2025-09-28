import { Request, Response } from "express";
import mongoose from "mongoose";
import { HTTPSTATUS } from "../config/http.config";
import ChannelModel from "../models/channel.model";
import ChannelMemberModel from "../models/channel-member.model";
import MessageModel from "../models/message.model";
import MessageReactionModel from "../models/message-reaction.model";
import UserStatusModel from "../models/user-status.model";

// Get all channels in a workspace
export const getAllChannelsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_WORKSPACE_ID",
        message: "Invalid workspace ID",
      });
    }

    // Get channels where user is a member
    const userChannels = await ChannelMemberModel.find({
      userId,
      isActive: true,
    }).populate({
      path: 'channelId',
      match: { workspaceId, isArchived: false },
      populate: [
        { path: 'createdBy', select: 'name email avatar' },
      ]
    });

    const channels = userChannels
      .filter(member => member.channelId)
      .map(member => ({
        ...(typeof member.channelId === 'object' ? member.channelId : {}),
        memberRole: member.role,
        lastReadAt: member.lastReadAt,
        notificationsEnabled: member.notificationsEnabled,
      }))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: { channels },
    });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch channels",
    });
  }
};

// Create a new channel
export const createChannelController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, type, isPrivate } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_WORKSPACE_ID",
        message: "Invalid workspace ID",
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MISSING_CHANNEL_NAME",
        message: "Channel name is required",
      });
    }

    // Check if channel name already exists in workspace
    const existingChannel = await ChannelModel.findOne({
      workspaceId,
      name: name.toLowerCase().trim(),
      isArchived: false,
    });

    if (existingChannel) {
      return res.status(HTTPSTATUS.CONFLICT).json({
        error: "CHANNEL_EXISTS",
        message: "Channel with this name already exists",
      });
    }

    const channelData = {
      name: name.toLowerCase().trim(),
      description,
      type: isPrivate ? 'private' : type || 'public',
      workspaceId,
      createdBy: userId,
    };

    const channel = new ChannelModel(channelData);
    await channel.save();

    // Add creator as admin member
    const memberData = {
      channelId: channel._id,
      userId,
      role: 'admin',
    };

    const member = new ChannelMemberModel(memberData);
    await member.save();

    // Update channel member count
    await ChannelModel.findByIdAndUpdate(channel._id, {
      membersCount: 1,
    });

    await channel.populate('createdBy', 'name email avatar');

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Channel created successfully",
      data: { channel },
    });
  } catch (error) {
    console.error("Error creating channel:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to create channel",
    });
  }
};

// Get messages in a channel with pagination
export const getChannelMessagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, channelId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or channel ID",
      });
    }

    // Check if user is a member of the channel
    const membership = await ChannelMemberModel.findOne({
      channelId,
      userId,
      isActive: true,
    });

    if (!membership) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You are not a member of this channel",
      });
    }

    // Build filter for pagination
    const filter: any = { 
      channelId, 
      isDeleted: false 
    };

    if (before) {
      filter.createdAt = { $lt: new Date(before as string) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await MessageModel.find(filter)
      .populate('senderId', 'name email avatar')
      .populate('replyToId', 'content senderId createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get reactions for messages
    const messageIds = messages.map(msg => msg._id);
    const reactions = await MessageReactionModel.find({
      messageId: { $in: messageIds }
    }).populate('userId', 'name email avatar');

    // Group reactions by message
    const reactionsByMessage = reactions.reduce((acc: any, reaction: any) => {
      if (!acc[reaction.messageId]) {
        acc[reaction.messageId] = [];
      }
      acc[reaction.messageId].push(reaction);
      return acc;
    }, {});

    // Add reactions to messages
    const messagesWithReactions = messages.map(message => ({
      ...message,
      reactions: reactionsByMessage[message._id.toString()] || [],
    }));

    // Update last read timestamp
    await ChannelMemberModel.findOneAndUpdate(
      { channelId, userId },
      { lastReadAt: new Date() }
    );

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        messages: messagesWithReactions.reverse(), // Return in chronological order
        pagination: {
          currentPage: Number(page),
          hasMore: messages.length === Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch messages",
    });
  }
};

// Send a message to a channel
export const sendMessageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, channelId } = req.params;
    const { content, replyToId, mentions } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or channel ID",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "EMPTY_MESSAGE",
        message: "Message content cannot be empty",
      });
    }

    // Check if user is a member of the channel
    const membership = await ChannelMemberModel.findOne({
      channelId,
      userId,
      isActive: true,
    });

    if (!membership) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You are not a member of this channel",
      });
    }

    const messageData: any = {
      content: content.trim(),
      channelId,
      senderId: userId,
      mentions: mentions || [],
    };

    if (replyToId && mongoose.Types.ObjectId.isValid(replyToId)) {
      messageData.replyToId = replyToId;
      
      // Update thread count for parent message
      await MessageModel.findByIdAndUpdate(replyToId, {
        $inc: { threadCount: 1 }
      });
    }

    const message = new MessageModel(messageData);
    await message.save();

    // Update channel's last message timestamp
    await ChannelModel.findByIdAndUpdate(channelId, {
      lastMessageAt: new Date(),
    });

    await message.populate([
      { path: 'senderId', select: 'name email avatar' },
      { path: 'replyToId', select: 'content senderId createdAt' },
    ]);

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Message sent successfully",
      data: { message },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to send message",
    });
  }
};

// Edit a message
export const editMessageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or message ID",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "EMPTY_MESSAGE",
        message: "Message content cannot be empty",
      });
    }

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "MESSAGE_NOT_FOUND",
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You can only edit your own messages",
      });
    }

    if (message.isDeleted) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MESSAGE_DELETED",
        message: "Cannot edit deleted message",
      });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate([
      { path: 'senderId', select: 'name email avatar' },
      { path: 'replyToId', select: 'content senderId createdAt' },
    ]);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Message edited successfully",
      data: { message },
    });
  } catch (error) {
    console.error("Error editing message:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to edit message",
    });
  }
};

// Delete a message
export const deleteMessageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, messageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or message ID",
      });
    }

    const message = await MessageModel.findById(messageId);

    if (!message) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "MESSAGE_NOT_FOUND",
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You can only delete your own messages",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = "[This message was deleted]";
    await message.save();

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete message",
    });
  }
};

// Add reaction to a message
export const addReactionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or message ID",
      });
    }

    if (!emoji || emoji.trim().length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MISSING_EMOJI",
        message: "Emoji is required",
      });
    }

    const message = await MessageModel.findById(messageId);

    if (!message || message.isDeleted) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "MESSAGE_NOT_FOUND",
        message: "Message not found",
      });
    }

    // Check if reaction already exists
    const existingReaction = await MessageReactionModel.findOne({
      messageId,
      userId,
      emoji: emoji.trim(),
    });

    if (existingReaction) {
      // Remove reaction if it exists (toggle behavior)
      await MessageReactionModel.findByIdAndDelete(existingReaction._id);
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Reaction removed successfully",
        data: { removed: true },
      });
    } else {
      // Add new reaction
      const reaction = new MessageReactionModel({
        messageId,
        userId,
        emoji: emoji.trim(),
      });
      await reaction.save();

      await reaction.populate('userId', 'name email avatar');

      return res.status(HTTPSTATUS.CREATED).json({
        success: true,
        message: "Reaction added successfully",
        data: { reaction, removed: false },
      });
    }
  } catch (error) {
    console.error("Error adding reaction:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to add reaction",
    });
  }
};

// Get channel members
export const getChannelMembersController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, channelId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or channel ID",
      });
    }

    // Check if user is a member of the channel
    const membership = await ChannelMemberModel.findOne({
      channelId,
      userId,
      isActive: true,
    });

    if (!membership) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You are not a member of this channel",
      });
    }

    const members = await ChannelMemberModel.find({
      channelId,
      isActive: true,
    })
      .populate('userId', 'name email avatar')
      .sort({ joinedAt: 1 });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    console.error("Error fetching channel members:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch channel members",
    });
  }
};

// Add member to channel
export const addChannelMemberController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, channelId } = req.params;
    const { userEmail } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or channel ID",
      });
    }

    if (!userEmail) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MISSING_USER_EMAIL",
        message: "User email is required",
      });
    }

    // Check if current user has permission to add members
    const membership = await ChannelMemberModel.findOne({
      channelId,
      userId,
      isActive: true,
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "Only channel admins can add members",
      });
    }

    // Find user to add
    const UserModel = mongoose.model('User');
    const userToAdd = await UserModel.findOne({ email: userEmail });

    if (!userToAdd) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "USER_NOT_FOUND",
        message: "User with this email not found",
      });
    }

    // Check if user is already a member
    const existingMembership = await ChannelMemberModel.findOne({
      channelId,
      userId: userToAdd._id,
    });

    if (existingMembership) {
      if (existingMembership.isActive) {
        return res.status(HTTPSTATUS.CONFLICT).json({
          error: "ALREADY_MEMBER",
          message: "User is already a member of this channel",
        });
      } else {
        // Reactivate membership
        existingMembership.isActive = true;
        existingMembership.joinedAt = new Date();
        await existingMembership.save();
      }
    } else {
      // Create new membership
      const newMember = new ChannelMemberModel({
        channelId,
        userId: userToAdd._id,
        role: 'member',
      });
      await newMember.save();
    }

    // Update channel member count
    const memberCount = await ChannelMemberModel.countDocuments({
      channelId,
      isActive: true,
    });

    await ChannelModel.findByIdAndUpdate(channelId, {
      membersCount: memberCount,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Member added successfully",
    });
  } catch (error) {
    console.error("Error adding channel member:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to add channel member",
    });
  }
};