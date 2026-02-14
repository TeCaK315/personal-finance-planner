export interface User {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    currency: string;
    language: string;
    notifications: boolean;
  };
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  categoryLimits: CategoryLimit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryLimit {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  budgetId: string;
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetStatus {
  budgetId: string;
  totalAmount: number;
  totalSpent: number;
  remainingAmount: number;
  percentageUsed: number;
  categoryBreakdown: CategoryUsage[];
  overspendingCategories: string[];
}

export interface CategoryUsage {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverspent: boolean;
}

export interface SpendingReport {
  userId: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  categoryBreakdown: CategorySpending[];
  topExpenseCategories: CategorySpending[];
  dailyAverageExpense: number;
  generatedAt: Date;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface TrendReport {
  userId: string;
  startDate: Date;
  endDate: Date;
  dataPoints: TrendDataPoint[];
  averageMonthlyExpense: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  generatedAt: Date;
}

export interface TrendDataPoint {
  date: Date;
  income: number;
  expenses: number;
  netSavings: number;
}

export interface AIRecommendation {
  _id: string;
  userId: string;
  type: 'savings' | 'budget_optimization' | 'spending_alert' | 'investment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  potentialSavings?: number;
  categoryId?: string;
  createdAt: Date;
  isRead: boolean;
  isDismissed: boolean;
}

export interface AIAnalysis {
  userId: string;
  spendingPatterns: SpendingPattern[];
  anomalies: Anomaly[];
  predictions: Prediction[];
  analyzedAt: Date;
}

export interface SpendingPattern {
  categoryId: string;
  categoryName: string;
  averageMonthlySpending: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality?: string;
}

export interface Anomaly {
  transactionId: string;
  categoryId: string;
  amount: number;
  date: Date;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Prediction {
  categoryId: string;
  categoryName: string;
  predictedAmount: number;
  confidence: number;
  period: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  type?: 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  categoryIds?: string[];
  budgetId?: string;
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: BulkImportError[];
}

export interface BulkImportError {
  row: number;
  field: string;
  message: string;
}