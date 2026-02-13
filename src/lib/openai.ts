import OpenAI from 'openai';
import type { Transaction, FinancialGoal, AIRecommendation } from '@/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please add your OpenAI API key to .env file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateRecommendationsParams {
  userId: string;
  transactions: Transaction[];
  goals: FinancialGoal[];
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}

export async function generateFinancialRecommendations(
  params: GenerateRecommendationsParams
): Promise<Omit<AIRecommendation, '_id' | 'generatedAt' | 'isRead'>[]> {
  const { userId, transactions, goals, timeframe } = params;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const prompt = `You are a professional financial advisor. Analyze the following financial data and provide 3-5 actionable recommendations.

Timeframe: ${timeframe}
Total Income: $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpenses.toFixed(2)}
Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}

Expense Breakdown by Category:
${Object.entries(categoryBreakdown)
  .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
  .join('\n')}

Financial Goals:
${goals.map((g) => `- ${g.name}: $${g.currentAmount}/$${g.targetAmount} (${g.progress}% complete)`).join('\n')}

Provide recommendations in the following JSON format:
[
  {
    "title": "Brief title",
    "description": "Detailed explanation",
    "category": "savings|spending|investment|debt|general",
    "priority": "high|medium|low",
    "actionItems": ["Action 1", "Action 2"],
    "impact": "Expected impact description"
  }
]

Focus on practical, specific advice based on the data provided.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional financial advisor providing personalized recommendations. Always respond with valid JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];

    return recommendations.map((rec: Omit<AIRecommendation, '_id' | 'userId' | 'generatedAt' | 'isRead'>) => ({
      userId,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      priority: rec.priority,
      actionItems: rec.actionItems,
      impact: rec.impact,
    }));
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate recommendations');
  }
}