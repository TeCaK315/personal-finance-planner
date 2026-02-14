import OpenAI from 'openai';
import { AIRecommendation, Transaction, Budget, CategorySpending } from '@/types';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

interface UserFinancialData {
  budgets: Budget[];
  transactions: Transaction[];
  userName: string;
}

export async function generateFinancialRecommendations(
  userData: UserFinancialData
): Promise<Omit<AIRecommendation, '_id'>[]> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

  const totalIncome = userData.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = userData.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categorySpendingMap = new Map<string, { amount: number; count: number }>();
  userData.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const existing = categorySpendingMap.get(t.categoryName) || { amount: 0, count: 0 };
      categorySpendingMap.set(t.categoryName, {
        amount: existing.amount + t.amount,
        count: existing.count + 1
      });
    });

  const categorySpending: CategorySpending[] = Array.from(categorySpendingMap.entries())
    .map(([categoryName, data]) => ({
      categoryName,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      transactionCount: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const prompt = `You are a financial advisor AI. Analyze the following financial data for ${userData.userName} and provide 3-5 actionable recommendations to improve financial health.

Budgets Overview:
${userData.budgets.map(b => `- ${b.name}: $${b.totalAmount} (${b.period})`).join('\n')}

Financial Summary:
- Total Income: $${totalIncome}
- Total Expenses: $${totalExpenses}
- Net: $${totalIncome - totalExpenses}
- Number of Transactions: ${userData.transactions.length}

Category Spending Breakdown:
${categorySpending.map(cat => `- ${cat.categoryName}: $${cat.amount} (${cat.percentage.toFixed(1)}%, ${cat.transactionCount} transactions)`).join('\n')}

Provide recommendations in the following JSON format:
[
  {
    "title": "Brief recommendation title",
    "description": "Detailed explanation of the recommendation",
    "priority": "high" | "medium" | "low",
    "category": "savings" | "spending" | "budgeting" | "income" | "debt",
    "potentialSavings": number (optional, estimated monthly savings),
    "actionItems": ["specific action 1", "specific action 2", ...]
  }
]

Focus on:
1. Identifying overspending categories
2. Suggesting budget reallocation
3. Finding savings opportunities
4. Recommending income optimization
5. Highlighting positive financial behaviors

Return ONLY valid JSON array, no additional text.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a professional financial advisor providing personalized recommendations based on spending data. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  let recommendations: any[];
  try {
    recommendations = JSON.parse(content);
  } catch (error) {
    throw new Error('Failed to parse OpenAI response as JSON');
  }

  return recommendations.map(rec => ({
    userId: '',
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    category: rec.category,
    potentialSavings: rec.potentialSavings,
    actionItems: rec.actionItems,
    generatedAt: new Date(),
    isRead: false
  }));
}