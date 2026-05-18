import { z } from 'zod';

export const guestDetailsSchema = z.object({
  guestName: z.string().min(1, 'Full name is required'),
  guestPhone: z.string().min(1, 'Phone number is required'),
  guestEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  topic: z.string().min(1, 'Topic is required'),
  notes: z.string().optional(),
});

export type GuestDetailsValues = z.infer<typeof guestDetailsSchema>;
