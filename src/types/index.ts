export enum TransactionCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  SHOPPING = 'shopping',
  SALARY = 'salary',
  INVESTMENT = 'investment',
  OTHER = 'other'
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum RecommendationType {
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  BUDGET_OPTIMIZATION = 'budget_optimization',
  DEBT_MANAGEMENT = 'debt_management'
}

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendData[];
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrendData {
  month: string;
  year: number;
  income: number;
  expenses: number;
  balance: number;
}

export interface Recommendation {
  _id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
  estimatedImpact?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTransactionRequest {
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  date: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  category?: TransactionCategory;
  type?: TransactionType;
  description?: string;
  date?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: TransactionCategory;
  type?: TransactionType;
  limit?: number;
  offset?: number;
}

export interface GenerateRecommendationsRequest {
  forceRegenerate?: boolean;
}