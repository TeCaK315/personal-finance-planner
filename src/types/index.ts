export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  totalAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate: Date;
  categories: CategoryAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryAllocation {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  budgetId: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: string;
}

export interface AIRecommendation {
  _id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  potentialSavings?: number;
  actionItems: string[];
  generatedAt: Date;
  isRead: boolean;
}

export interface BudgetSummary {
  budgetId: string;
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  remainingBudget: number;
  percentageUsed: number;
  categoryBreakdown: CategoryBreakdown[];
  topSpendingCategories: CategorySpending[];
  dailyAverageSpending: number;
  projectedEndBalance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface CategorySpending {
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface TransactionFilters {
  budgetId?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface SpendingTrend {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  expiresAt: Date;
}