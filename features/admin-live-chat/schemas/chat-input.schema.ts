import { z } from 'zod';

export const chatInputSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty'),
});

export type ChatInputValues = z.infer<typeof chatInputSchema>;
