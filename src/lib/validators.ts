import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  period: z.enum(['monthly', 'yearly']),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  categories: z.array(
    z.object({
      categoryId: z.string().min(1, 'Category ID is required'),
      allocatedAmount: z.number().min(0, 'Allocated amount must be positive'),
    })
  ).min(1, 'At least one category is required'),
});

export const transactionSchema = z.object({
  budgetId: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date',
  }),
  recurring: z.boolean().optional(),
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  tags: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use hex color)'),
  icon: z.string().optional(),
});