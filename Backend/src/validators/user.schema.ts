import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/i, 'Invalid user id'),
});

export const userUpdateSchema = z
  .object({
    bio: z.string().max(500).optional().or(z.literal('').transform(() => undefined)),
    links: z.array(z.string().url()).optional(),
    experience: z.array(z.string().min(1)).optional(),
    skills: z.array(z.string().min(1)).optional(),
    portfolio: z
      .array(z.object({ url: z.string().url(), title: z.string().optional() }))
      .optional(),
    // Files are handled by multer; include markers to indicate intention
    // We accept multipart/form-data and read files from req.files
  })
  .strict();

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
