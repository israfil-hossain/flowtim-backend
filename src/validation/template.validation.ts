import { z } from "zod";
import { TaskPriorityEnum } from "../enums/task.enum";

const templateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum([
    TaskPriorityEnum.LOW,
    TaskPriorityEnum.MEDIUM,
    TaskPriorityEnum.HIGH,
    TaskPriorityEnum.HIGH,
  ]).optional(),
  estimatedHours: z.number().min(0.5).optional(),
  daysFromStart: z.number().min(0).optional(),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Template name is required").max(100, "Template name too long"),
    description: z.string().min(1, "Description is required"),
    category: z.enum([
      "web-development",
      "mobile-development",
      "marketing",
      "design",
      "research",
      "event-planning",
      "product-launch",
      "other",
    ]),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    estimatedDuration: z.number().min(1, "Estimated duration must be at least 1 day"),
    tasks: z.array(templateTaskSchema).optional(),
  }),
});

export const createProjectFromTemplateSchema = z.object({
  body: z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().optional(),
    startDate: z.string().datetime().optional(),
    customizations: z.object({
      taskAssignments: z.record(z.string()).optional(),
    }).optional(),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Template name is required").max(100, "Template name too long").optional(),
    description: z.string().min(1, "Description is required").optional(),
    category: z.enum([
      "web-development",
      "mobile-development",
      "marketing",
      "design",
      "research",
      "event-planning",
      "product-launch",
      "other",
    ]).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    estimatedDuration: z.number().min(1, "Estimated duration must be at least 1 day").optional(),
  }),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateProjectFromTemplateInput = z.infer<typeof createProjectFromTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;