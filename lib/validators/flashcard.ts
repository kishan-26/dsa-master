import { z } from "zod";

export const createFlashcardSchema = z.object({
  question: z.string().min(1, "A source question is required"),
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required"),
});
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;

export const updateFlashcardSchema = z.object({
  front: z.string().min(1).optional(),
  back: z.string().min(1).optional(),
});
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
