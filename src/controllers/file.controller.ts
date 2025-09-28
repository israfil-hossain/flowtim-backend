import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import FileModel from "../models/file.model";
import FolderModel from "../models/folder.model";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Add file type validation here if needed
    cb(null, true);
  },
});

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { projectId, folderId } = req.body;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Determine file category based on mime type
    const getFileCategory = (mimeType: string) => {
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      if (mimeType.startsWith("audio/")) return "audio";
      if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "document";
      return "other";
    };

    const newFile = new FileModel({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: getFileCategory(req.file.mimetype),
      uploadedBy: userId,
      workspace: workspaceId,
      project: projectId || undefined,
      parentFolder: folderId || undefined,
    });

    await newFile.save();

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "File uploaded successfully",
      data: newFile,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { projectId, folderId, category, page = 1, limit = 20 } = req.query;

    const filter: any = {
      workspace: workspaceId,
      isDeleted: false,
    };

    if (projectId) filter.project = projectId;
    if (folderId) filter.parentFolder = folderId;
    if (category) filter.category = category;

    const files = await FileModel.find(filter)
      .populate("uploadedBy", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await FileModel.countDocuments(filter);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch files",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.id;

    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "File not found",
      });
    }

    // Mark as deleted instead of actually deleting
    file.isDeleted = true;
    await file.save();

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const file = await FileModel.findById(fileId);
    if (!file || file.isDeleted) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "File not found",
      });
    }

    if (!fs.existsSync(file.filePath)) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Type", file.mimeType);
    
    return res.sendFile(path.resolve(file.filePath));
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to download file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { name, parentId } = req.body;
    const userId = req.user?.id;

    const newFolder = new FolderModel({
      name,
      parentId: parentId || undefined,
      workspace: workspaceId,
      createdBy: userId,
    });

    await newFolder.save();

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Folder created successfully",
      data: newFolder,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create folder",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { parentId } = req.query;

    const filter: any = {
      workspace: workspaceId,
      isDeleted: false,
    };

    if (parentId) {
      filter.parentId = parentId;
    } else {
      filter.parentId = { $exists: false };
    }

    const folders = await FolderModel.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: folders,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch folders",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export { upload };