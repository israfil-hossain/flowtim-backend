/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management endpoints
 */

import { Router } from "express";
import {
  getAllDocumentsController,
  createDocumentController,
  getDocumentByIdController,
  updateDocumentController,
  deleteDocumentController,
  getDocumentVersionsController,
  shareDocumentController,
  startCollaborationController,
} from "../controllers/document.controller";
import {
  upload,
  uploadDocumentAttachmentsController,
  removeDocumentAttachmentController,
  downloadDocumentAttachmentController,
} from "../controllers/document-upload.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents:
 *   get:
 *     tags: [Documents]
 *     summary: Get all documents in a workspace with filters
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, meeting-notes, specification, manual, report, other]
 *         description: Filter by document category
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search in title and content
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Document'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalDocuments:
 *                           type: integer
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/workspace/:workspaceId/documents", getAllDocumentsController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Create a new document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Document title
 *               content:
 *                 type: string
 *                 description: Document content
 *               category:
 *                 type: string
 *                 enum: [general, meeting-notes, specification, manual, report, other]
 *                 default: general
 *                 description: Document category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Document tags
 *               projectId:
 *                 type: string
 *                 description: Associated project ID
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Whether document is publicly accessible
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/workspace/:workspaceId/documents", createDocumentController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}:
 *   get:
 *     tags: [Documents]
 *     summary: Get a specific document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/workspace/:workspaceId/documents/:documentId", getDocumentByIdController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}:
 *   put:
 *     tags: [Documents]
 *     summary: Update a document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Document title
 *               content:
 *                 type: string
 *                 description: Document content
 *               category:
 *                 type: string
 *                 enum: [general, meeting-notes, specification, manual, report, other]
 *                 description: Document category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Document tags
 *               projectId:
 *                 type: string
 *                 description: Associated project ID
 *               isPublic:
 *                 type: boolean
 *                 description: Whether document is publicly accessible
 *               changes:
 *                 type: string
 *                 description: Description of changes made
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/workspace/:workspaceId/documents/:documentId", updateDocumentController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete a document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/workspace/:workspaceId/documents/:documentId", deleteDocumentController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}/versions:
 *   get:
 *     tags: [Documents]
 *     summary: Get document versions
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     versions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentVersion'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/workspace/:workspaceId/documents/:documentId/versions", getDocumentVersionsController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}/share:
 *   post:
 *     tags: [Documents]
 *     summary: Share a document with another user
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sharedWithEmail
 *               - permission
 *             properties:
 *               sharedWithEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of user to share with
 *               permission:
 *                 type: string
 *                 enum: [view, comment, edit, admin]
 *                 description: Permission level to grant
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date for the share
 *     responses:
 *       200:
 *         description: Document shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     share:
 *                       $ref: '#/components/schemas/DocumentShare'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/workspace/:workspaceId/documents/:documentId/share", shareDocumentController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}/collaborate:
 *   post:
 *     tags: [Documents]
 *     summary: Start collaboration on a document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Collaboration started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     collaborator:
 *                       $ref: '#/components/schemas/DocumentCollaborator'
 *                     activeCollaborators:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentCollaborator'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/workspace/:workspaceId/documents/:documentId/collaborate", startCollaborationController);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}/attachments:
 *   post:
 *     tags: [Documents]
 *     summary: Upload attachments to a document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 5 files, 10MB each)
 *     responses:
 *       200:
 *         description: Attachments uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           size:
 *                             type: number
 *                           mimeType:
 *                             type: string
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                     totalAttachments:
 *                       type: number
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/workspace/:workspaceId/documents/:documentId/attachments",
  upload.array('files', 5),
  uploadDocumentAttachmentsController
);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Documents]
 *     summary: Remove an attachment from a document
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document or attachment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/workspace/:workspaceId/documents/:documentId/attachments/:attachmentId",
  removeDocumentAttachmentController
);

/**
 * @swagger
 * /api/document/workspace/{workspaceId}/documents/{documentId}/attachments/{attachmentId}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download a document attachment
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Document or attachment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/workspace/:workspaceId/documents/:documentId/attachments/:attachmentId/download",
  downloadDocumentAttachmentController
);

export default router;