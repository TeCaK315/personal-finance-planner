import OpenAI from 'openai';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';
import { AIRecommendation, Transaction, Budget, FinancialGoal } from '@/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please add your OPENAI_API_KEY to .env.local');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFinancialRecommendations(userId: string): Promise<AIRecommendation[]> {
  const db = await getDb();

  const transactions = await db
    .collection('transactions')
    .find({ userId: new ObjectId(userId) })
    .sort({ date: -1 })
    .limit(100)
    .toArray();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const budget = await db.collection('budgets').findOne({
    userId: new ObjectId(userId),
    month: currentMonth,
  });

  const goals = await db
    .collection('financial_goals')
    .find({ userId: new ObjectId(userId), status: 'active' })
    .toArray();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const prompt = `You are a financial advisor AI. Analyze the following financial data and provide 3-5 actionable recommendations:

Income: $${totalIncome.toFixed(2)}
Expenses: $${totalExpenses.toFixed(2)}
Balance: $${(totalIncome - totalExpenses).toFixed(2)}

Expense Breakdown:
${Object.entries(categoryExpenses)
  .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`)
  .join('\n')}

${budget ? `Budget Limits:\n${budget.categoryLimits.map((cl: any) => `- ${cl.category}: $${cl.limit}`).join('\n')}` : 'No budget set'}

${goals.length > 0 ? `Active Goals:\n${goals.map((g: any) => `- ${g.title}: $${g.currentAmount}/$${g.targetAmount} by ${new Date(g.deadline).toLocaleDateString()}`).join('\n')}` : 'No active goals'}

Provide recommendations in the following JSON format:
[
  {
    "type": "savings|spending|investment|goal|budget",
    "title": "Short recommendation title",
    "description": "Detailed explanation",
    "priority": "high|medium|low",
    "potentialSavings": number (optional),
    "actionItems": ["action 1", "action 2", "action 3"]
  }
]

Focus on practical, specific advice based on the data. Identify overspending, suggest savings opportunities, and help achieve goals.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a professional financial advisor providing personalized recommendations. Always respond with valid JSON array.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = completion.choices[0]?.message?.content || '[]';
  
  let recommendationsData: any[];
  try {
    recommendationsData = JSON.parse(content);
  } catch (error) {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      recommendationsData = JSON.parse(jsonMatch[0]);
    } else {
      recommendationsData = [];
    }
  }

  const recommendations: AIRecommendation[] = recommendationsData.map((rec) => ({
    _id: new ObjectId().toString(),
    userId,
    type: rec.type || 'budget',
    title: rec.title || 'Financial Recommendation',
    description: rec.description || '',
    priority: rec.priority || 'medium',
    potentialSavings: rec.potentialSavings,
    actionItems: rec.actionItems || [],
    generatedAt: new Date(),
    dismissed: false,
  }));

  await db.collection('ai_recommendations').insertMany(
    recommendations.map((rec) => ({
      ...rec,
      _id: new ObjectId(rec._id),
      userId: new ObjectId(rec.userId),
    }))
  );

  return recommendations;
}