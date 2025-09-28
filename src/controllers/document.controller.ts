import { Request, Response } from "express";
import mongoose from "mongoose";
import { HTTPSTATUS } from "../config/http.config";
import DocumentModel from "../models/document.model";
import DocumentVersionModel from "../models/document-version.model";
import DocumentShareModel, { PermissionLevel } from "../models/document-share.model";
import DocumentCollaboratorModel from "../models/document-collaborator.model";


// Get all documents in a workspace with filters
export const getAllDocumentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const { 
      category, 
      tags, 
      projectId, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_WORKSPACE_ID",
        message: "Invalid workspace ID",
      });
    }

    // Build filter object
    const filter: any = { workspaceId };

    if (category) {
      filter.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          error: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        });
      }
      filter.projectId = projectId;
    }

    // Add text search if provided
    if (search) {
      filter.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const documents = await DocumentModel.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await DocumentModel.countDocuments(filter);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalDocuments: total,
          hasNextPage: skip + Number(limit) < total,
          hasPrevPage: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch documents",
    });
  }
};

// Create a new document
export const createDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const { title, content, category, tags, projectId, isPublic } = req.body;
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

    if (!title || !content) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MISSING_REQUIRED_FIELDS",
        message: "Title and content are required",
      });
    }

    const documentData: any = {
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      createdBy: userId,
      workspaceId,
      isPublic: isPublic || false,
    };

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          error: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        });
      }
      documentData.projectId = projectId;
    }

    const document = new DocumentModel(documentData);
    await document.save();

    // Create initial version
    const initialVersion = new DocumentVersionModel({
      documentId: document._id,
      version: 1,
      title,
      content,
      changes: "Initial document creation",
      createdBy: userId,
    });
    await initialVersion.save();

    await document.populate('createdBy', 'name email avatar');
    if (document.projectId) {
      await document.populate('projectId', 'name');
    }

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Document created successfully",
      data: { document },
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to create document",
    });
  }
};

// Get a specific document
export const getDocumentByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
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
    })
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'name')
      .lean();

    if (!document) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "DOCUMENT_NOT_FOUND",
        message: "Document not found",
      });
    }

    // Check if user has permission to view the document
    const hasAccess = await checkDocumentAccess(documentId, userId, 'view');
    if (!hasAccess && document.createdBy._id.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to view this document",
      });
    }

    // Update collaborator status
    await DocumentCollaboratorModel.findOneAndUpdate(
      { documentId, userId },
      { 
        isActive: true, 
        lastSeenAt: new Date(),
        userId,
        documentId,
      },
      { upsert: true }
    );

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: { document },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch document",
    });
  }
};

// Update a document
export const updateDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
    const { title, content, category, tags, projectId, isPublic, changes } = req.body;
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
    const hasAccess = await checkDocumentAccess(documentId, userId, 'edit');
    if (!hasAccess && document.createdBy.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to edit this document",
      });
    }

    // Get current version number
    const latestVersion = await DocumentVersionModel.findOne(
      { documentId },
      {},
      { sort: { version: -1 } }
    );

    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

    // Create new version before updating
    if (content && content !== document.content) {
      const newVersion = new DocumentVersionModel({
        documentId,
        version: newVersionNumber,
        title: title || document.title,
        content,
        changes: changes || `Updated by ${req.user?.name}`,
        createdBy: userId,
      });
      await newVersion.save();
    }

    // Update document
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (projectId !== undefined) {
      if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          error: "INVALID_PROJECT_ID",
          message: "Invalid project ID",
        });
      }
      updateData.projectId = projectId || null;
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedDocument = await DocumentModel.findByIdAndUpdate(
      documentId,
      updateData,
      { new: true }
    )
      .populate('createdBy', 'name email avatar')
      .populate('projectId', 'name');

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Document updated successfully",
      data: { document: updatedDocument },
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to update document",
    });
  }
};

// Delete a document
export const deleteDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
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

    // Check if user has permission to delete the document
    const hasAccess = await checkDocumentAccess(documentId, userId, 'admin');
    if (!hasAccess && document.createdBy.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to delete this document",
      });
    }

    // Delete document and related data
    await Promise.all([
      DocumentModel.findByIdAndDelete(documentId),
      DocumentVersionModel.deleteMany({ documentId }),
      DocumentShareModel.deleteMany({ documentId }),
      DocumentCollaboratorModel.deleteMany({ documentId }),
    ]);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete document",
    });
  }
};

// Get document versions
export const getDocumentVersionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
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

    // Check if document exists and user has access
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

    const hasAccess = await checkDocumentAccess(documentId, userId, 'view');
    if (!hasAccess && document.createdBy.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to view this document",
      });
    }

    const versions = await DocumentVersionModel.find({ documentId })
      .populate('createdBy', 'name email avatar')
      .sort({ version: -1 })
      .lean();

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: { versions },
    });
  } catch (error) {
    console.error("Error fetching document versions:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch document versions",
    });
  }
};

// Share document
export const shareDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
    const { sharedWithEmail, permission, expiresAt } = req.body;
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

    if (!sharedWithEmail || !permission) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "MISSING_REQUIRED_FIELDS",
        message: "Email and permission are required",
      });
    }

    const validPermissions: PermissionLevel[] = ['view', 'comment', 'edit', 'admin'];
    if (!validPermissions.includes(permission)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        error: "INVALID_PERMISSION",
        message: "Invalid permission level",
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

    // Check if user has permission to share the document
    const hasAccess = await checkDocumentAccess(documentId, userId, 'edit');
    if (!hasAccess && document.createdBy.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to share this document",
      });
    }

    // Find user to share with
    const UserModel = mongoose.model('User');
    const sharedWithUser = await UserModel.findOne({ email: sharedWithEmail });

    if (!sharedWithUser) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        error: "USER_NOT_FOUND",
        message: "User with this email not found",
      });
    }

    // Create or update share
    const shareData = {
      documentId,
      sharedWith: sharedWithUser._id,
      sharedBy: userId,
      permission,
      isActive: true,
      ...(expiresAt && { expiresAt: new Date(expiresAt) }),
    };

    const share = await DocumentShareModel.findOneAndUpdate(
      { documentId, sharedWith: sharedWithUser._id },
      shareData,
      { upsert: true, new: true }
    ).populate('sharedWith', 'name email avatar');

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Document shared successfully",
      data: { share },
    });
  } catch (error) {
    console.error("Error sharing document:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to share document",
    });
  }
};

// Start collaboration
export const startCollaborationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { workspaceId, documentId } = req.params;
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

    // Check if user has permission to collaborate
    const hasAccess = await checkDocumentAccess(documentId, userId, 'view');
    if (!hasAccess && document.createdBy.toString() !== userId) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        error: "ACCESS_DENIED",
        message: "You don't have permission to collaborate on this document",
      });
    }

    // Update or create collaborator record
    const collaborator = await DocumentCollaboratorModel.findOneAndUpdate(
      { documentId, userId },
      { 
        isActive: true, 
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true }
    ).populate('userId', 'name email avatar');

    // Get all active collaborators
    const activeCollaborators = await DocumentCollaboratorModel.find({
      documentId,
      isActive: true,
      lastSeenAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Active in last 5 minutes
    }).populate('userId', 'name email avatar');

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Collaboration started successfully",
      data: { 
        collaborator,
        activeCollaborators,
      },
    });
  } catch (error) {
    console.error("Error starting collaboration:", error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to start collaboration",
    });
  }
};

// Helper function to check document access
async function checkDocumentAccess(
  documentId: string, 
  userId: string, 
  requiredPermission: PermissionLevel
): Promise<boolean> {
  const share = await DocumentShareModel.findOne({
    documentId,
    sharedWith: userId,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });

  if (!share) return false;

  const permissionHierarchy: PermissionLevel[] = ['view', 'comment', 'edit', 'admin'];
  const userPermissionLevel = permissionHierarchy.indexOf(share.permission);
  const requiredPermissionLevel = permissionHierarchy.indexOf(requiredPermission);

  return userPermissionLevel >= requiredPermissionLevel;
}