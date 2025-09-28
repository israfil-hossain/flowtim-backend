import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import AutomationRuleModel, { TriggerType, ActionType } from "../models/automation-rule.model";
import AutomationLogModel, { ExecutionStatus } from "../models/automation-log.model";

// Get automation rules
export const getAutomationRules = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, limit = 20, isActive } = req.query;

    const filter: any = { workspaceId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const rules = await AutomationRuleModel.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AutomationRuleModel.countDocuments(filter);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: rules,
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
      message: "Failed to fetch automation rules",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create automation rule
export const createAutomationRule = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { name, triggerType, triggerConditions, actions } = req.body;
    const userId = req.user?.id;

    // Validate trigger type
    if (!Object.values(TriggerType).includes(triggerType)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid trigger type",
      });
    }

    // Validate actions
    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "At least one action is required",
      });
    }

    for (const action of actions) {
      if (!Object.values(ActionType).includes(action.type)) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          success: false,
          message: `Invalid action type: ${action.type}`,
        });
      }
    }

    const rule = new AutomationRuleModel({
      name,
      workspaceId,
      triggerType,
      triggerConditions: triggerConditions || {},
      actions: actions.map((action: any, index: number) => ({
        ...action,
        order: action.order || index + 1,
      })),
      createdBy: userId,
    });

    await rule.save();
    await rule.populate("createdBy", "name email");

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      message: "Automation rule created successfully",
      data: rule,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create automation rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update automation rule
export const updateAutomationRule = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const { name, triggerType, triggerConditions, actions, isActive } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (triggerType) updateData.triggerType = triggerType;
    if (triggerConditions) updateData.triggerConditions = triggerConditions;
    if (actions) updateData.actions = actions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const rule = await AutomationRuleModel.findByIdAndUpdate(
      ruleId,
      updateData,
      { new: true }
    ).populate("createdBy", "name email");

    if (!rule) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Automation rule not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Automation rule updated successfully",
      data: rule,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update automation rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete automation rule
export const deleteAutomationRule = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;

    const rule = await AutomationRuleModel.findByIdAndDelete(ruleId);

    if (!rule) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Automation rule not found",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Automation rule deleted successfully",
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete automation rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Test automation rule
export const testAutomationRule = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const { testData } = req.body;

    const rule = await AutomationRuleModel.findById(ruleId);
    if (!rule) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "Automation rule not found",
      });
    }

    // Simulate rule execution
    const startTime = Date.now();
    const executionResults = [];

    for (const action of rule.actions.sort((a, b) => a.order - b.order)) {
      try {
        // Simulate action execution
        const actionResult = await simulateActionExecution(action.type, action.config, testData);
        executionResults.push({
          actionType: action.type,
          status: ExecutionStatus.SUCCESS,
          result: actionResult,
          executedAt: new Date(),
        });
      } catch (error) {
        executionResults.push({
          actionType: action.type,
          status: ExecutionStatus.FAILED,
          error: error instanceof Error ? error.message : "Unknown error",
          executedAt: new Date(),
        });
      }
    }

    const executionTime = Date.now() - startTime;
    const overallStatus = executionResults.every(r => r.status === ExecutionStatus.SUCCESS)
      ? ExecutionStatus.SUCCESS
      : ExecutionStatus.FAILED;

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Automation rule test completed",
      data: {
        executionTime,
        overallStatus,
        actionsExecuted: executionResults,
      },
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to test automation rule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get automation logs
export const getAutomationLogs = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, limit = 20, ruleId, status } = req.query;

    const filter: any = { workspaceId };
    if (ruleId) filter.ruleId = ruleId;
    if (status) filter.overallStatus = status;

    const logs = await AutomationLogModel.find(filter)
      .populate("ruleId", "name")
      .populate("relatedTaskId", "title taskCode")
      .populate("relatedProjectId", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AutomationLogModel.countDocuments(filter);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: logs,
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
      message: "Failed to fetch automation logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get automation templates
export const getAutomationTemplates = async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: "task-auto-assign",
        name: "Auto-assign tasks",
        description: "Automatically assign tasks based on criteria",
        triggerType: TriggerType.TASK_STATUS_CHANGED,
        triggerConditions: { fromStatus: "TODO", toStatus: "IN_PROGRESS" },
        actions: [
          {
            type: ActionType.ASSIGN_TASK,
            config: { assignTo: "project_manager" },
            order: 1,
          },
        ],
      },
      {
        id: "due-date-reminder",
        name: "Due date reminder",
        description: "Send notifications when tasks are due soon",
        triggerType: TriggerType.DUE_DATE_APPROACHING,
        triggerConditions: { daysBefore: 1 },
        actions: [
          {
            type: ActionType.SEND_NOTIFICATION,
            config: { message: "Task is due tomorrow" },
            order: 1,
          },
        ],
      },
      {
        id: "completion-workflow",
        name: "Task completion workflow",
        description: "Create follow-up tasks when a task is completed",
        triggerType: TriggerType.TASK_COMPLETED,
        triggerConditions: {},
        actions: [
          {
            type: ActionType.CREATE_SUBTASK,
            config: { title: "Review completed work" },
            order: 1,
          },
          {
            type: ActionType.SEND_NOTIFICATION,
            config: { message: "Task completed!" },
            order: 2,
          },
        ],
      },
    ];

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch automation templates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to simulate action execution for testing
async function simulateActionExecution(actionType: ActionType, config: any, testData: any) {
  switch (actionType) {
    case ActionType.ASSIGN_TASK:
      return { assignedTo: config.assignTo || "test-user" };
    case ActionType.CHANGE_STATUS:
      return { newStatus: config.status || "IN_PROGRESS" };
    case ActionType.SEND_NOTIFICATION:
      return { notificationSent: true, message: config.message };
    case ActionType.ADD_COMMENT:
      return { commentAdded: true, comment: config.comment };
    default:
      return { executed: true, actionType };
  }
}