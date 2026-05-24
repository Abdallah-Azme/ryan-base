import { z } from 'zod';

export const userProjectEditSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  estimatedPrice: z.union([z.string(), z.number()]).optional(),
  estimatedDuration: z.union([z.string(), z.number()]).optional(),
  status: z.enum(['pricing', 'design', 'development', 'publishing', 'support', 'completed', 'cancelled']),
  projectUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  industryOther: z.string().optional(),
});

export type UserProjectEditValues = z.infer<typeof userProjectEditSchema>;
