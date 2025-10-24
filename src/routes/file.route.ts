import express from "express";
import {
  uploadFile,
  getFiles,
  deleteFile,
  downloadFile,
  createFolder,
  getFolders,
  upload,
} from "../controllers/file.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";

const router = express.Router();

// File routes
router.post(
  "/workspaces/:workspaceId/files/upload",
  isAuthenticated,
  upload.single("file"),
  asyncHandler(uploadFile)
);

router.get(
  "/workspaces/:workspaceId/files",
  isAuthenticated,
  asyncHandler(getFiles)
);

router.delete(
  "/workspaces/:workspaceId/files/:fileId",
  isAuthenticated,
  asyncHandler(deleteFile)
);

router.get(
  "/files/:fileId/download",
  isAuthenticated,
  asyncHandler(downloadFile)
);

// Folder routes
router.post(
  "/workspaces/:workspaceId/folders",
  isAuthenticated,
  asyncHandler(createFolder)
);

router.get(
  "/workspaces/:workspaceId/folders",
  isAuthenticated,
  asyncHandler(getFolders)
);

export default router;