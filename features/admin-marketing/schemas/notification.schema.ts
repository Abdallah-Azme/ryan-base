import { z } from 'zod';

export const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  deepLink: z.string().optional(),
  isScheduled: z.boolean(),
  scheduledDate: z.string().optional(),
}).refine(data => {
  if (data.isScheduled) {
    return !!data.scheduledDate && data.scheduledDate.length > 0;
  }
  return true;
}, {
  message: 'Scheduled date is required if scheduling',
  path: ['scheduledDate'],
});

export type NotificationValues = z.infer<typeof notificationSchema>;
