import { z } from 'zod';

export const adminProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export type AdminProfileValues = z.infer<typeof adminProfileSchema>;
