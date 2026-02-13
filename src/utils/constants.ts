export const TRANSACTION_CATEGORIES = {
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Rental Income',
    'Gifts',
    'Refunds',
    'Other Income',
  ],
  expense: [
    'Housing',
    'Transportation',
    'Food & Dining',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Shopping',
    'Education',
    'Personal Care',
    'Insurance',
    'Savings',
    'Investments',
    'Debt Payment',
    'Gifts & Donations',
    'Travel',
    'Business',
    'Other',
  ],
} as const;

export const GOAL_TYPES = [
  { value: 'short-term', label: 'Short-term (< 1 year)' },
  { value: 'long-term', label: 'Long-term (> 1 year)' },
] as const;

export const DATE_RANGES = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 3 months' },
  { value: 'year', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
] as const;

export const RECOMMENDATION_CATEGORIES = [
  { value: 'savings', label: 'Savings', color: '#22d3ee' },
  { value: 'spending', label: 'Spending', color: '#f59e0b' },
  { value: 'investment', label: 'Investment', color: '#8b5cf6' },
  { value: 'debt', label: 'Debt', color: '#ef4444' },
  { value: 'general', label: 'General', color: '#6366f1' },
] as const;

export const PRIORITY_LEVELS = [
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low', label: 'Low', color: '#22c55e' },
] as const;

export const GOAL_STATUS = [
  { value: 'active', label: 'Active', color: '#22c55e' },
  { value: 'completed', label: 'Completed', color: '#6366f1' },
  { value: 'cancelled', label: 'Cancelled', color: '#64748b' },
] as const;