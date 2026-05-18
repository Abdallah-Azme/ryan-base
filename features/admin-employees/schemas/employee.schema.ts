import { z } from 'zod';

export const getEmployeeSchema = (isEditing: boolean) => z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Disabled']),
  password: isEditing ? z.string().optional() : z.string().min(8, 'Password must be at least 8 characters'),
});

export type EmployeeValues = z.infer<ReturnType<typeof getEmployeeSchema>>;
