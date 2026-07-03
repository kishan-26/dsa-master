import { z } from "zod";

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const createTopicSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().optional(),
  color: z.string().optional(),
});
export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const createPatternSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().optional(),
});
export type CreatePatternInput = z.infer<typeof createPatternSchema>;

export { slugify };
