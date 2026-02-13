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
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: CategoryTotal[];
  monthlyTrend: MonthlyData[];
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface FinancialGoal {
  _id: string;
  userId: string;
  name: string;
  type: 'short-term' | 'long-term';
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  description?: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AIRecommendation {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: 'savings' | 'spending' | 'investment' | 'debt' | 'general';
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  impact: string;
  generatedAt: Date;
  isRead: boolean;
}

export interface DashboardStats {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  activeGoals: number;
  completedGoals: number;
  recentTransactions: Transaction[];
  topCategories: CategoryTotal[];
  monthlyTrend: MonthlyData[];
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

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface BudgetCalculationRequest {
  startDate: Date;
  endDate: Date;
  categories?: string[];
}

export interface GoalProgressUpdate {
  amount: number;
  note?: string;
}

export interface RecommendationRequest {
  includeTransactions: boolean;
  includeGoals: boolean;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}