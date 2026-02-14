export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  categories: BudgetCategory[];
  totalIncome: number;
  totalExpenses: number;
  status: 'active' | 'completed' | 'exceeded';
  healthScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  percentage: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  budgetId?: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialRecommendation {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: 'savings' | 'spending' | 'investment' | 'debt' | 'budget';
  priority: 'low' | 'medium' | 'high';
  potentialSavings?: number;
  actionItems: string[];
  basedOnData: {
    budgetId?: string;
    categoryId?: string;
    transactionIds?: string[];
    analysisDate: Date;
  };
  status: 'new' | 'viewed' | 'applied' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAlert {
  _id: string;
  userId: string;
  budgetId: string;
  categoryId?: string;
  type: 'budget_exceeded' | 'approaching_limit' | 'unusual_spending' | 'savings_opportunity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  threshold?: number;
  currentAmount?: number;
  dismissed: boolean;
  createdAt: Date;
}

export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  budgetHealth: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  period: DateRange;
}

export interface SpendingTrend {
  date: string;
  income: number;
  expenses: number;
  savings: number;
  categories: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
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

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface BudgetHealthMetrics {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: {
    spendingRatio: number;
    savingsRatio: number;
    categoryBalance: number;
    consistency: number;
  };
  recommendations: string[];
}