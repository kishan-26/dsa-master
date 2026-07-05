import { z } from "zod";
import {
  DIFFICULTIES,
  QUESTION_STATUSES,
  PLATFORMS,
  BIG_O_VALUES,
  MISTAKE_TAGS,
} from "@/lib/constants/question";

const codeApproachSchema = z.object({
  code: z.string().default(""),
  language: z.string().default("cpp"),
  timeComplexity: z.enum(BIG_O_VALUES).optional(),
  spaceComplexity: z.enum(BIG_O_VALUES).optional(),
});

export const createQuestionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  difficulty: z.enum(DIFFICULTIES),
  topic: z.string().min(1, "Topic is required"),
  patterns: z.array(z.string()).default([]),
  platform: z.enum(PLATFORMS).default("LeetCode"),
  leetcodeId: z.string().optional(),
  leetcodeSlug: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  topic: z.string().optional(),
  patterns: z.array(z.string()).optional(),
  platform: z.enum(PLATFORMS).optional(),
  leetcodeId: z.string().optional(),
  leetcodeSlug: z.string().optional(),
  status: z.enum(QUESTION_STATUSES).optional(),
  confidence: z.number().min(1).max(5).optional(),
  isFavorite: z.boolean().optional(),
  notes: z.string().optional(),
  editorialNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  code: z
    .object({
      brute: codeApproachSchema.optional(),
      better: codeApproachSchema.optional(),
      optimal: codeApproachSchema.optional(),
    })
    .optional(),
});
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

export const logAttemptSchema = z.object({
  status: z.enum(["Failed", "Solved", "Gave Up"]),
  timeTakenMinutes: z.number().min(0).max(600).optional(),
  mistakes: z.array(z.enum(MISTAKE_TAGS)).default([]),
  notes: z.string().max(2000).optional(),
});
export type LogAttemptInput = z.infer<typeof logAttemptSchema>;

export const bulkImportItemSchema = z.object({
  title: z.string().min(1).max(200),
  difficulty: z.enum(DIFFICULTIES),
  leetcodeSlug: z.string().min(1),
  topic: z.string().min(1).max(80),
  patterns: z.array(z.string().max(80)).default([]),
});

export const bulkImportSchema = z.object({
  items: z.array(bulkImportItemSchema).min(1).max(500),
});
export type BulkImportInput = z.infer<typeof bulkImportSchema>;

export const questionListQuerySchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  status: z.enum(QUESTION_STATUSES).optional(),
  favorite: z.coerce.boolean().optional(),
  revisionDue: z.coerce.boolean().optional(),
  topic: z.string().optional(),
  pattern: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest", "title", "difficulty", "confidence", "revisionDue"]).default("newest"),
});
export type QuestionListQuery = z.infer<typeof questionListQuerySchema>;
