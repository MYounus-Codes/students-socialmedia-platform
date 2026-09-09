import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url().max(500)]).optional();

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(1000).optional(),
  institution: z.string().trim().max(160).optional(),
  education_level: z.string().trim().max(80).optional(),
  major: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  website: optionalUrl,
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
