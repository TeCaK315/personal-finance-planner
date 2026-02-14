import OpenAI from 'openai';
import type { Budget, Transaction, Category, FinancialRecommendation } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

interface FinancialData {
  budget: Budget;
  transactions: Transaction[];
  categories: Category[];
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
}

export function analyzeFinancialData(
  budget: Budget,
  transactions: Transaction[],
  categories: Category[]
): FinancialData {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    budget,
    transactions,
    categories,
    totalIncome,
    totalExpenses,
    savingsRate,
  };
}

export function formatRecommendationPrompt(data: FinancialData): string {
  const categorySpending = data.budget.categories.map((cat) => {
    const category = data.categories.find((c) => c._id === cat.categoryId);
    return {
      name: cat.categoryName || category?.name || 'Unknown',
      allocated: cat.allocatedAmount,
      spent: cat.spentAmount,
      percentage: cat.percentage,
    };
  });

  const topSpendingCategories = [...categorySpending]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const recentTransactions = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((t) => {
      const category = data.categories.find((c) => c._id === t.categoryId);
      return {
        type: t.type,
        amount: t.amount,
        category: category?.name || 'Unknown',
        description: t.description,
        date: t.date,
      };
    });

  return `You are a financial advisor AI. Analyze the following financial data and provide 3-5 personalized recommendations.

Budget Overview:
- Budget Name: ${data.budget.name}
- Period: ${data.budget.period}
- Total Income: $${data.totalIncome.toFixed(2)}
- Total Expenses: $${data.totalExpenses.toFixed(2)}
- Savings Rate: ${data.savingsRate.toFixed(1)}%
- Budget Health Score: ${data.budget.healthScore || 'N/A'}

Top Spending Categories:
${topSpendingCategories.map((cat) => `- ${cat.name}: $${cat.spent.toFixed(2)} / $${cat.allocated.toFixed(2)} (${cat.percentage.toFixed(1)}%)`).join('\n')}

Recent Transactions:
${recentTransactions.map((t) => `- ${t.type}: $${t.amount.toFixed(2)} in ${t.category} - ${t.description}`).join('\n')}

Please provide recommendations in the following JSON format:
[
  {
    "title": "Brief recommendation title",
    "description": "Detailed explanation of the recommendation",
    "category": "savings|spending|investment|debt|budget",
    "priority": "low|medium|high",
    "potentialSavings": 0,
    "actionItems": ["Action 1", "Action 2", "Action 3"]
  }
]

Focus on:
1. Areas where spending exceeds budget
2. Opportunities to increase savings
3. Unusual spending patterns
4. Budget optimization suggestions
5. Long-term financial health improvements`;
}

export async function generateRecommendations(
  userId: string,
  data: FinancialData
): Promise<FinancialRecommendation[]> {
  try {
    const prompt = formatRecommendationPrompt(data);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor. Provide practical, actionable financial recommendations based on user data. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const recommendationsData = JSON.parse(content);

    const recommendations: FinancialRecommendation[] = recommendationsData.map(
      (rec: {
        title: string;
        description: string;
        category: 'savings' | 'spending' | 'investment' | 'debt' | 'budget';
        priority: 'low' | 'medium' | 'high';
        potentialSavings?: number;
        actionItems: string[];
      }) => ({
        _id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        priority: rec.priority,
        potentialSavings: rec.potentialSavings,
        actionItems: rec.actionItems,
        basedOnData: {
          budgetId: data.budget._id,
          analysisDate: new Date(),
        },
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}