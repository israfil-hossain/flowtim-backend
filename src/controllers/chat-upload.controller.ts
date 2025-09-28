import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { HTTPSTATUS } from "../config/http.config";
import MessageModel from "../models/message.model";
import ChannelMemberModel from "../models/channel-member.model";

// Configure multer for message file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'messages');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types for messages
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed',
    'application/json',
    'text/javascript',
    'text/css',
    'text/html',
    'application/x-javascript',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const messageUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 10, // Maximum 10 files per message
  },
});

// Send message with file attachments
export const sendMessageWithAttachmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, channelId } = req.params;
    const { content, replyToId, mentions } = req.body;
    const userId = req.user?._id;
    const files = req.files as Express.Multer.File[];

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

    // Content is optional when files are attached, but at least one must be provided
    if ((!content || content.trim().length === 0) && (!files || files.length === 0)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "EMPTY_MESSAGE",
        message: "Message must have content or attachments",
      });
    }

    // Check if user is a member of the channel
    const membership = await ChannelMemberModel.findOne({
      channelId,
      userId,
      isActive: true,
    });

    if (!membership) {
      // Clean up uploaded files if user not authorized
      if (files) {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You are not a member of this channel",
      });
    }

    const messageData: any = {
      content: content ? content.trim() : (files.length > 0 ? "📎 File attachment" : ""),
      type: files && files.length > 0 ? (files.some(f => f.mimetype.startsWith('image/')) ? 'image' : 'file') : 'text',
      channelId,
      senderId: userId,
      mentions: mentions || [],
    };

    // Add attachments if files were uploaded
    if (files && files.length > 0) {
      messageData.attachments = files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/uploads/messages/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      }));
    }

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
    const ChannelModel = (await import('../models/channel.model')).default;
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
    console.error("Error sending message with attachments:", error);

    // Clean up uploaded files on error
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    if (error instanceof Error && error.message.includes('File type')) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_FILE_TYPE",
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes('File too large')) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "FILE_TOO_LARGE",
        message: "File size exceeds 25MB limit",
      });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to send message",
    });
  }
};

// Download message attachment
export const downloadMessageAttachmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, messageId, attachmentId } = req.params;
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

    if (!message || message.isDeleted) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "MESSAGE_NOT_FOUND",
        message: "Message not found",
      });
    }

    // Check if user has access to the channel
    const membership = await ChannelMemberModel.findOne({
      channelId: message.channelId,
      userId,
      isActive: true,
    });

    if (!membership) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have access to this channel",
      });
    }

    // Find the attachment
    const attachment = message.attachments.find(
      att => att._id?.toString() === attachmentId
    );

    if (!attachment) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "ATTACHMENT_NOT_FOUND",
        message: "Attachment not found",
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'messages', path.basename(attachment.fileUrl));

    if (!fs.existsSync(filePath)) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "FILE_NOT_FOUND",
        message: "File not found on server",
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Length', attachment.fileSize.toString());

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading message attachment:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to download attachment",
    });
  }
};

// Search messages in workspace/channel
export const searchMessagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const { query, channelId, page = 1, limit = 20, fromUserId, dateFrom, dateTo } = req.query;
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

    if (!query || (query as string).trim().length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MISSING_QUERY",
        message: "Search query is required",
      });
    }

    // Get channels user is member of
    let userChannels = await ChannelMemberModel.find({
      userId,
      isActive: true,
    }).populate({
      path: 'channelId',
      match: { workspaceId }
    });

    userChannels = userChannels.filter(member => member.channelId);
    const channelIds = userChannels.map(member => member.channelId._id);

    if (channelIds.length === 0) {
      return res.status(HTTPSTATUS.OK).json({
        success: true,
        data: { 
          messages: [], 
          pagination: { currentPage: 1, totalPages: 0, hasMore: false } 
        },
      });
    }

    // Build search filter
    const searchFilter: any = {
      channelId: { $in: channelIds },
      isDeleted: false,
      $text: { $search: query as string }
    };

    // Add optional filters
    if (channelId && mongoose.Types.ObjectId.isValid(channelId as string)) {
      searchFilter.channelId = channelId;
    }

    if (fromUserId && mongoose.Types.ObjectId.isValid(fromUserId as string)) {
      searchFilter.senderId = fromUserId;
    }

    if (dateFrom || dateTo) {
      searchFilter.createdAt = {};
      if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      MessageModel.find(searchFilter)
        .populate('senderId', 'name email avatar')
        .populate('channelId', 'name type')
        .populate('replyToId', 'content senderId')
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      MessageModel.countDocuments(searchFilter)
    ]);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          hasMore: skip + Number(limit) < total,
          totalResults: total,
        },
      },
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to search messages",
    });
  }
};