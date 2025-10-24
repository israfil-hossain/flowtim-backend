import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import TaskModel from "../models/task.model";
import KanbanColumnModel from "../models/kanban-column.model";

// Get tasks organized by Kanban columns
export const getKanbanBoard = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { projectId } = req.query;

    // Get custom columns or create default ones
    let columns = await KanbanColumnModel.find({
      workspaceId,
      ...(projectId && { projectId }),
    }).sort({ position: 1 });

    // Create default columns if none exist
    if (columns.length === 0) {
      const defaultColumns = [
        { name: "To Do", color: "#6b7280", statusMapping: ["TODO"], position: 1 },
        { name: "In Progress", color: "#3b82f6", statusMapping: ["IN_PROGRESS"], position: 2 },
        { name: "In Review", color: "#f59e0b", statusMapping: ["IN_REVIEW"], position: 3 },
        { name: "Completed", color: "#10b981", statusMapping: ["DONE"], position: 4 },
      ];

      columns = await Promise.all(
        defaultColumns.map(col =>
          KanbanColumnModel.create({
            ...col,
            workspaceId,
            projectId: projectId || undefined,
            isDefault: true,
            createdBy: req.user?.id,
          })
        )
      );
    }

    // Get tasks for each column
    const boardData = await Promise.all(
      columns.map(async (column) => {
        const tasks = await TaskModel.find({
          workspace: workspaceId,
          ...(projectId && { project: projectId }),
          status: { $in: column.statusMapping },
        })
          .populate("assignedTo", "name email avatar")
          .populate("createdBy", "name email")
          .populate("project", "name")
          .sort({ createdAt: -1 });

        return {
          id: column._id,
          name: column.name,
          color: column.color,
          position: column.position,
          statusMapping: column.statusMapping,
          tasks,
        };
      })
    );

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        columns: boardData,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch kanban board",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Move task between columns
export const moveTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { columnId, position } = req.body;

    // Get the target column
    const column = await KanbanColumnModel.findById(columnId);
    if (!column) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Column not found",
      });
    }

    // Update task status based on column mapping
    const newStatus = column.statusMapping[0]; // Use first status in mapping
    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      { 
        status: newStatus,
        // Add position handling if needed
      },
      { new: true }
    )
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .populate("project", "name");

    if (!task) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Task moved successfully",
      data: { task },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to move task",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get kanban columns
export const getKanbanColumns = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { projectId } = req.query;

    const columns = await KanbanColumnModel.find({
      workspaceId,
      ...(projectId && { projectId }),
    })
      .populate("createdBy", "name email")
      .sort({ position: 1 });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: { columns },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch columns",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create custom kanban column
export const createKanbanColumn = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { name, color, statusMapping, projectId } = req.body;
    const userId = req.user?.id;

    // Get the next position
    const lastColumn = await KanbanColumnModel.findOne({
      workspaceId,
      ...(projectId && { projectId }),
    }).sort({ position: -1 });

    const position = lastColumn ? lastColumn.position + 1 : 1;

    const column = new KanbanColumnModel({
      name,
      color: color || "#6366f1",
      statusMapping,
      position,
      workspaceId,
      projectId: projectId || undefined,
      createdBy: userId,
    });

    await column.save();
    await column.populate("createdBy", "name email");

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Column created successfully",
      data: { column },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create column",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update kanban column
export const updateKanbanColumn = async (req: Request, res: Response) => {
  try {
    const { columnId } = req.params;
    const { name, color, statusMapping } = req.body;

    const column = await KanbanColumnModel.findByIdAndUpdate(
      columnId,
      { name, color, statusMapping },
      { new: true }
    ).populate("createdBy", "name email");

    if (!column) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Column not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Column updated successfully",
      data: { column },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update column",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete kanban column
export const deleteKanbanColumn = async (req: Request, res: Response) => {
  try {
    const { columnId } = req.params;

    const column = await KanbanColumnModel.findById(columnId);
    if (!column) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Column not found",
      });
    }

    // Prevent deletion of default columns
    if (column.isDefault) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Cannot delete default columns",
      });
    }

    await KanbanColumnModel.findByIdAndDelete(columnId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Column deleted successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete column",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};