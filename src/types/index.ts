export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'salary' 
  | 'freelance' 
  | 'investment' 
  | 'other_income'
  | 'housing' 
  | 'transportation' 
  | 'food' 
  | 'utilities' 
  | 'healthcare' 
  | 'entertainment' 
  | 'shopping' 
  | 'education' 
  | 'other_expense';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  _id: string;
  userId: string;
  month: string;
  categoryLimits: {
    category: TransactionCategory;
    limit: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: {
    category: TransactionCategory;
    spent: number;
    limit: number;
    percentage: number;
  }[];
  month: string;
}

export interface FinancialGoal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgress {
  goalId: string;
  percentage: number;
  remainingAmount: number;
  daysRemaining: number;
  monthlyRequiredSavings: number;
  onTrack: boolean;
}

export interface AIRecommendation {
  _id: string;
  userId: string;
  type: 'savings' | 'spending' | 'investment' | 'goal' | 'budget';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  actionItems: string[];
  generatedAt: Date;
  dismissed: boolean;
}

export interface ApiResponse<T = any> {
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

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: Date;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

export interface CreateGoalRequest {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {}

export interface UpdateGoalProgressRequest {
  amount: number;
}

export interface CreateBudgetRequest {
  month: string;
  categoryLimits: {
    category: TransactionCategory;
    limit: number;
  }[];
}

export interface GenerateRecommendationsRequest {
  forceRefresh?: boolean;
}