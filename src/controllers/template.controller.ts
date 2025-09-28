import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import ProjectTemplateModel from "../models/project-template.model";
import TemplateTaskModel from "../models/template-task.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";

export const getPublicTemplates = async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const filter: any = { isPublic: true };
    
    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    const templates = await ProjectTemplateModel.find(filter)
      .populate("createdBy", "name email")
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ProjectTemplateModel.countDocuments(filter);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: templates,
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
      message: "Failed to fetch templates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getWorkspaceTemplates = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    const templates = await ProjectTemplateModel.find({
      $or: [
        { isPublic: true },
        { createdBy: userId },
      ],
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch workspace templates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const {
      name,
      description,
      category,
      isPublic,
      tags,
      estimatedDuration,
      tasks,
    } = req.body;
    const userId = req.user?.id;

    const template = new ProjectTemplateModel({
      name,
      description,
      category,
      createdBy: userId,
      isPublic: isPublic || false,
      tags: tags || [],
      estimatedDuration,
    });

    await template.save();

    // Create template tasks if provided
    if (tasks && tasks.length > 0) {
      const templateTasks = tasks.map((task: any, index: number) => ({
        template: template._id,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        estimatedHours: task.estimatedHours || 1,
        order: index + 1,
        daysFromStart: task.daysFromStart || 0,
      }));

      await TemplateTaskModel.insertMany(templateTasks);
    }

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTemplateDetails = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    const template = await ProjectTemplateModel.findById(templateId)
      .populate("createdBy", "name email");

    if (!template) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Template not found",
      });
    }

    const tasks = await TemplateTaskModel.find({ template: templateId })
      .sort({ order: 1 });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: {
        template,
        tasks,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch template details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createProjectFromTemplate = async (req: Request, res: Response) => {
  try {
    const { workspaceId, templateId } = req.params;
    const { projectName, projectDescription, startDate, customizations } = req.body;
    const userId = req.user?.id;

    const template = await ProjectTemplateModel.findById(templateId);
    if (!template) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Template not found",
      });
    }

    // Create the project
    const project = new ProjectModel({
      name: projectName,
      description: projectDescription || template.description,
      workspace: workspaceId,
      createdBy: userId,
    });

    await project.save();

    // Get template tasks
    const templateTasks = await TemplateTaskModel.find({ template: templateId })
      .sort({ order: 1 });

    // Create tasks from template
    const projectStartDate = startDate ? new Date(startDate) : new Date();
    const taskMap = new Map(); // To track created tasks for dependency mapping

    for (const templateTask of templateTasks) {
      const taskDueDate = new Date(projectStartDate);
      taskDueDate.setDate(taskDueDate.getDate() + templateTask.daysFromStart + 1);

      const task = new TaskModel({
        title: templateTask.title,
        description: templateTask.description,
        project: project._id,
        workspace: workspaceId,
        priority: templateTask.priority,
        createdBy: userId,
        dueDate: taskDueDate,
        // Apply customizations if provided
        assignedTo: customizations?.taskAssignments?.[(templateTask._id as any).toString()] || null,
      });

      await task.save();
      taskMap.set((templateTask._id as any).toString(), task._id);
    }

    // Increment template usage count
    await ProjectTemplateModel.findByIdAndUpdate(templateId, {
      $inc: { usageCount: 1 },
    });

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Project created from template successfully",
      data: {
        project,
        tasksCreated: templateTasks.length,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create project from template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;

    const template = await ProjectTemplateModel.findOne({
      _id: templateId,
      createdBy: userId,
    });

    if (!template) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Template not found or you don't have permission to update it",
      });
    }

    const updatedTemplate = await ProjectTemplateModel.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true }
    ).populate("createdBy", "name email");

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Template updated successfully",
      data: updatedTemplate,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;

    const template = await ProjectTemplateModel.findOne({
      _id: templateId,
      createdBy: userId,
    });

    if (!template) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Template not found or you don't have permission to delete it",
      });
    }

    // Delete template and its tasks
    await Promise.all([
      ProjectTemplateModel.findByIdAndDelete(templateId),
      TemplateTaskModel.deleteMany({ template: templateId }),
    ]);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete template",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPopularTemplates = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const templates = await ProjectTemplateModel.find({ isPublic: true })
      .populate("createdBy", "name email")
      .sort({ usageCount: -1 })
      .limit(Number(limit));

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch popular templates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTemplateCategories = async (req: Request, res: Response) => {
  try {
    const categories = [
      { value: "web-development", label: "Web Development" },
      { value: "mobile-development", label: "Mobile Development" },
      { value: "marketing", label: "Marketing" },
      { value: "design", label: "Design" },
      { value: "research", label: "Research" },
      { value: "event-planning", label: "Event Planning" },
      { value: "product-launch", label: "Product Launch" },
      { value: "other", label: "Other" },
    ];

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch template categories",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};