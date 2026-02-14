import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  categoryLimits: z.array(
    z.object({
      categoryId: z.string().min(1, 'Category ID is required'),
      limit: z.number().nonnegative('Limit must be non-negative'),
    })
  ),
});

export const transactionSchema = z.object({
  budgetId: z.string().min(1, 'Budget ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], { required_error: 'Type must be income or expense' }),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});