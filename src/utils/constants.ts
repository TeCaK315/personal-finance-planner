export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'utensils', color: '#ef4444' },
  { name: 'Transportation', icon: 'car', color: '#f59e0b' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#8b5cf6' },
  { name: 'Entertainment', icon: 'film', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: 'file-text', color: '#3b82f6' },
  { name: 'Healthcare', icon: 'heart', color: '#10b981' },
  { name: 'Education', icon: 'book', color: '#6366f1' },
  { name: 'Travel', icon: 'plane', color: '#14b8a6' },
  { name: 'Income', icon: 'dollar-sign', color: '#22c55e' },
  { name: 'Other', icon: 'more-horizontal', color: '#64748b' },
];

export const CHART_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#22d3ee',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#3b82f6',
  '#14b8a6',
  '#64748b',
];

export const PAGINATION_LIMITS = {
  transactions: 20,
  budgets: 10,
  categories: 50,
  recommendations: 10,
};

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  api: 'yyyy-MM-dd',
  full: 'MMMM dd, yyyy HH:mm:ss',
};