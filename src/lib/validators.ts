import { z } from 'zod';
import {
  TransactionType,
  TransactionCategory,
  CreateTransactionRequest,
  CreateBudgetRequest,
  CreateGoalRequest,
  RegisterRequest,
} from '@/types';

const transactionCategories: TransactionCategory[] = [
  'salary',
  'freelance',
  'investment',
  'other_income',
  'housing',
  'transportation',
  'food',
  'utilities',
  'healthcare',
  'entertainment',
  'shopping',
  'education',
  'other_expense',
];

const transactionSchema = z.object({
  type: z.enum(['income', 'expense'] as const),
  category: z.enum(transactionCategories as [TransactionCategory, ...TransactionCategory[]]),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.date(),
});

const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  categoryLimits: z
    .array(
      z.object({
        category: z.enum(transactionCategories as [TransactionCategory, ...TransactionCategory[]]),
        limit: z.number().min(0, 'Limit must be non-negative'),
      })
    )
    .min(1, 'At least one category limit is required'),
});

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount must be non-negative'),
  deadline: z.date().refine((date) => date > new Date(), {
    message: 'Deadline must be in the future',
  }),
});

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export function validateTransaction(data: any): {
  success: boolean;
  data?: CreateTransactionRequest;
  errors?: Record<string, string>;
} {
  try {
    const parsed = transactionSchema.parse({
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
    });
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateBudget(data: any): {
  success: boolean;
  data?: CreateBudgetRequest;
  errors?: Record<string, string>;
} {
  try {
    const parsed = budgetSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateGoal(data: any): {
  success: boolean;
  data?: CreateGoalRequest;
  errors?: Record<string, string>;
} {
  try {
    const parsed = goalSchema.parse({
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : new Date(),
    });
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateUser(data: any): {
  success: boolean;
  data?: RegisterRequest;
  errors?: Record<string, string>;
} {
  try {
    const parsed = userSchema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}