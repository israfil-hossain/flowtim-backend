import { z } from "zod";

export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Folder name is required").max(100, "Folder name too long"),
    parentId: z.string().optional(),
  }),
});

export const uploadFileSchema = z.object({
  body: z.object({
    projectId: z.string().optional(),
    folderId: z.string().optional(),
  }),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;