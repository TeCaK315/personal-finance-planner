import OpenAI from 'openai';
import { AIRecommendation, SpendingPattern, Anomaly, Prediction, Transaction, Category } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

export async function generateFinancialRecommendations(
  userId: string,
  transactions: Transaction[],
  categories: Category[],
  totalBudget: number
): Promise<AIRecommendation[]> {
  const categoryMap = new Map(categories.map(c => [c._id, c.name]));

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryName = categoryMap.get(t.categoryId) || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  const prompt = `You are a financial advisor AI. Analyze the following spending data and provide 3-5 personalized financial recommendations.

Total Budget: $${totalBudget}
Total Expenses: $${totalExpenses}
Spending by Category:
${Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

Provide recommendations in the following JSON format:
[
  {
    "type": "savings" | "budget_optimization" | "spending_alert" | "investment",
    "priority": "high" | "medium" | "low",
    "title": "Short recommendation title",
    "description": "Detailed explanation",
    "actionItems": ["Action 1", "Action 2"],
    "potentialSavings": 100,
    "categoryId": "optional-category-id"
  }
]`;

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'You are a financial advisor providing actionable recommendations.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const responseContent = completion.choices[0].message.content || '{"recommendations": []}';
  const parsed = JSON.parse(responseContent);
  const recommendationsData = parsed.recommendations || [];

  const recommendations: AIRecommendation[] = recommendationsData.map((rec: {
    type: 'savings' | 'budget_optimization' | 'spending_alert' | 'investment';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
    potentialSavings?: number;
    categoryId?: string;
  }) => ({
    _id: '',
    userId,
    type: rec.type,
    priority: rec.priority,
    title: rec.title,
    description: rec.description,
    actionItems: rec.actionItems,
    potentialSavings: rec.potentialSavings,
    categoryId: rec.categoryId,
    createdAt: new Date(),
    isRead: false,
    isDismissed: false,
  }));

  return recommendations;
}

export async function analyzeSpendingPatterns(
  transactions: Transaction[],
  categories: Category[]
): Promise<SpendingPattern[]> {
  const categoryMap = new Map(categories.map(c => [c._id, c]));

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryId = t.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

  const patterns: SpendingPattern[] = [];

  for (const [categoryId, categoryTransactions] of Object.entries(expensesByCategory)) {
    const category = categoryMap.get(categoryId);
    if (!category) continue;

    const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageMonthlySpending = totalAmount / Math.max(1, categoryTransactions.length / 30);

    const sortedByDate = [...categoryTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (sortedByDate.length >= 2) {
      const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
      const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));

      const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.amount, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.amount, 0) / secondHalf.length;

      if (secondHalfAvg > firstHalfAvg * 1.1) {
        trend = 'increasing';
      } else if (secondHalfAvg < firstHalfAvg * 0.9) {
        trend = 'decreasing';
      }
    }

    patterns.push({
      categoryId,
      categoryName: category.name,
      averageMonthlySpending,
      trend,
    });
  }

  return patterns;
}

export async function predictFutureExpenses(
  transactions: Transaction[],
  categories: Category[]
): Promise<Prediction[]> {
  const categoryMap = new Map(categories.map(c => [c._id, c]));

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryId = t.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

  const predictions: Prediction[] = [];

  for (const [categoryId, categoryTransactions] of Object.entries(expensesByCategory)) {
    const category = categoryMap.get(categoryId);
    if (!category) continue;

    const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalAmount / categoryTransactions.length;

    const predictedAmount = averageAmount * 30;
    const confidence = Math.min(0.95, categoryTransactions.length / 100);

    predictions.push({
      categoryId,
      categoryName: category.name,
      predictedAmount,
      confidence,
      period: 'next_month',
    });
  }

  return predictions;
}