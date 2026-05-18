import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required').max(120, 'Description max length is 120'),
  link: z.string().url('Please enter a valid URL'),
  logoUrl: z.string().optional(),
});

export type ProjectValues = z.infer<typeof projectSchema>;
