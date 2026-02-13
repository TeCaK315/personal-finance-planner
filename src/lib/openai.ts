import OpenAI from 'openai';
import { Recommendation, RecommendationType } from '@/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please add your OpenAI API key to .env.local');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  transactionCount: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}

export async function generateRecommendations(
  userId: string,
  financialData: FinancialData
): Promise<Omit<Recommendation, '_id' | 'createdAt'>[]> {
  try {
    const prompt = `You are a professional financial advisor. Analyze the following financial data and provide 5-7 personalized, actionable financial recommendations.

Financial Summary:
- Total Income: $${financialData.totalIncome.toFixed(2)}
- Total Expenses: $${financialData.totalExpenses.toFixed(2)}
- Current Balance: $${financialData.balance.toFixed(2)}
- Average Monthly Income: $${financialData.averageMonthlyIncome.toFixed(2)}
- Average Monthly Expenses: $${financialData.averageMonthlyExpenses.toFixed(2)}
- Number of Transactions: ${financialData.transactionCount}

Spending Breakdown by Category:
${financialData.categoryBreakdown.map(cat => `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`).join('\n')}

Provide recommendations in the following JSON format:
[
  {
    "type": "savings" | "investment" | "budget_optimization" | "debt_management",
    "title": "Short, actionable title",
    "description": "Detailed explanation with specific numbers and steps",
    "priority": 1-10 (10 being highest priority),
    "actionable": true,
    "estimatedImpact": "Estimated financial impact (e.g., 'Save $200/month')"
  }
]

Focus on:
1. Identifying overspending categories
2. Suggesting realistic savings goals
3. Investment opportunities based on their balance
4. Budget optimization strategies
5. Emergency fund recommendations

Return ONLY valid JSON array, no additional text.`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor who provides personalized, actionable financial advice. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const recommendations = JSON.parse(content) as Array<{
      type: RecommendationType;
      title: string;
      description: string;
      priority: number;
      actionable: boolean;
      estimatedImpact?: string;
    }>;

    return recommendations.map(rec => ({
      userId,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      actionable: rec.actionable,
      estimatedImpact: rec.estimatedImpact,
    }));
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate AI recommendations');
  }
}