import { z } from "zod";
import { TaskPriorityEnum } from "../enums/task.enum";

export const createSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().optional(),
    priority: z.enum([
      TaskPriorityEnum.LOW,
      TaskPriorityEnum.MEDIUM,
      TaskPriorityEnum.HIGH,
      TaskPriorityEnum.HIGH,
    ]).optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
    description: z.string().optional(),
    priority: z.enum([
      TaskPriorityEnum.LOW,
      TaskPriorityEnum.MEDIUM,
      TaskPriorityEnum.HIGH,
      TaskPriorityEnum.HIGH,
    ]).optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    status: z.string().optional(),
  }),
});

export const reorderSubtasksSchema = z.object({
  body: z.object({
    subtaskIds: z.array(z.string()).min(1, "At least one subtask ID is required"),
  }),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
export type ReorderSubtasksInput = z.infer<typeof reorderSubtasksSchema>;