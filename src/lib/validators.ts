import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name is too long'),
  totalAmount: z.number().positive('Total amount must be positive'),
  period: z.enum(['monthly', 'weekly', 'yearly'], {
    errorMap: () => ({ message: 'Period must be monthly, weekly, or yearly' })
  }),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date'
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date'
  }),
  categories: z.array(
    z.object({
      categoryId: z.string().min(1, 'Category ID is required'),
      categoryName: z.string().min(1, 'Category name is required'),
      allocatedAmount: z.number().nonnegative('Allocated amount must be non-negative')
    })
  ).min(1, 'At least one category is required')
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
).refine(
  (data) => {
    const totalAllocated = data.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    return totalAllocated <= data.totalAmount;
  },
  {
    message: 'Total allocated amount cannot exceed budget total',
    path: ['categories']
  }
);

export const budgetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  totalAmount: z.number().positive().optional(),
  categories: z.array(
    z.object({
      categoryId: z.string().min(1),
      categoryName: z.string().min(1),
      allocatedAmount: z.number().nonnegative(),
      spentAmount: z.number().nonnegative().optional()
    })
  ).optional()
});

export const transactionSchema = z.object({
  budgetId: z.string().min(1, 'Budget ID is required'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be income or expense' })
  }),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category ID is required'),
  categoryName: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date'
  })
});

export const transactionUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
  categoryName: z.string().min(1).optional(),
  description: z.string().min(1).max(500).optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date'
  }).optional()
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name is too long'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be income or expense' })
  }),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
});

// Helper validation functions
export function validateUser(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof userSchema> } {
  try {
    const validated = userSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

export function validateLogin(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof loginSchema> } {
  try {
    const validated = loginSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

export function validateBudget(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof budgetSchema> } {
  try {
    const validated = budgetSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

export function validateBudgetUpdate(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof budgetUpdateSchema> } {
  try {
    const validated = budgetUpdateSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

export function validateTransaction(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof transactionSchema> } {
  try {
    const validated = transactionSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

export function validateTransactionUpdate(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof transactionUpdateSchema> } {
  try {
    const validated = transactionUpdateSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}

export function validateCategory(data: unknown): { valid: boolean; error?: string; data?: z.infer<typeof categorySchema> } {
  try {
    const validated = categorySchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
}