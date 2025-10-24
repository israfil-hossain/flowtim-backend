import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { HTTPSTATUS } from "../config/http.config";
import DocumentModel from "../models/document.model";


// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'documents');
    
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
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
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
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per upload
  },
});

// Upload attachments to a document
export const uploadDocumentAttachmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
    const userId = req.user?._id;
    const files = req.files as Express.Multer.File[];

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or document ID",
      });
    }

    if (!files || files.length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "NO_FILES",
        message: "No files uploaded",
      });
    }

    const document = await DocumentModel.findOne({
      _id: documentId,
      workspaceId,
    });

    if (!document) {
      // Clean up uploaded files if document not found
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "DOCUMENT_NOT_FOUND",
        message: "Document not found",
      });
    }

    // Check if user has permission to edit the document
    if (document.createdBy.toString() !== userId) {
      // TODO: Check shared document permissions
      // For now, only document creator can add attachments
      
      // Clean up uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to add attachments to this document",
      });
    }

    // Prepare attachment objects
    const newAttachments = files.map(file => ({
      name: file.originalname,
      url: `/uploads/documents/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
    }));

    // Add attachments to document
    document.attachments.push(...newAttachments);
    await document.save();

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Attachments uploaded successfully",
      data: {
        attachments: newAttachments,
        totalAttachments: document.attachments.length,
      },
    });
  } catch (error) {
    console.error("Error uploading attachments:", error);

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
        message: "File size exceeds 10MB limit",
      });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to upload attachments",
    });
  }
};

// Remove attachment from document
export const removeDocumentAttachmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId, attachmentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or document ID",
      });
    }

    const document = await DocumentModel.findOne({
      _id: documentId,
      workspaceId,
    });

    if (!document) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "DOCUMENT_NOT_FOUND",
        message: "Document not found",
      });
    }

    // Check if user has permission to edit the document
    if (document.createdBy.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to remove attachments from this document",
      });
    }

    // Find and remove the attachment
    const attachmentIndex = document.attachments.findIndex(
      attachment => (attachment as any)._id?.toString() === attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "ATTACHMENT_NOT_FOUND",
        message: "Attachment not found",
      });
    }

    const attachment = document.attachments[attachmentIndex];
    
    // Remove file from filesystem
    const filePath = path.join(process.cwd(), 'uploads', 'documents', path.basename(attachment.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove attachment from document
    document.attachments.splice(attachmentIndex, 1);
    await document.save();

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Attachment removed successfully",
      data: {
        removedAttachment: attachment,
        remainingAttachments: document.attachments.length,
      },
    });
  } catch (error) {
    console.error("Error removing attachment:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to remove attachment",
    });
  }
};

// Download document attachment
export const downloadDocumentAttachmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId, attachmentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || 
        !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_ID",
        message: "Invalid workspace or document ID",
      });
    }

    const document = await DocumentModel.findOne({
      _id: documentId,
      workspaceId,
    });

    if (!document) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "DOCUMENT_NOT_FOUND",
        message: "Document not found",
      });
    }

    // Check if user has permission to view the document
    if (document.createdBy.toString() !== userId) {
      // TODO: Check shared document permissions
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to access this document",
      });
    }

    // Find the attachment
    const attachment = document.attachments.find(
      att => (att as any)._id?.toString() === attachmentId
    );

    if (!attachment) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "ATTACHMENT_NOT_FOUND",
        message: "Attachment not found",
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'documents', path.basename(attachment.url));

    if (!fs.existsSync(filePath)) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "FILE_NOT_FOUND",
        message: "File not found on server",
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.name}"`);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Length', attachment.size.toString());

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to download attachment",
    });
  }
};