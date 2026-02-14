import OpenAI from 'openai';
import type { Budget, Transaction, Category, FinancialRecommendation } from '@/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Please add your OpenAI API key to .env.local');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

interface FinancialData {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  userId: string;
}

export async function generateFinancialRecommendations(
  data: FinancialData
): Promise<Omit<FinancialRecommendation, '_id' | 'userId' | 'createdAt' | 'updatedAt'>[]> {
  const prompt = buildAnalysisPrompt(data);

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an expert financial advisor. Analyze the user's financial data and provide actionable recommendations. 
        Return your response as a JSON array of recommendations. Each recommendation must have:
        - title: string (concise title)
        - description: string (detailed explanation)
        - category: 'savings' | 'spending' | 'investment' | 'debt' | 'budget'
        - priority: 'low' | 'medium' | 'high'
        - potentialSavings: number (estimated monthly savings in dollars, 0 if not applicable)
        - actionItems: string[] (specific steps to take)
        - basedOnData: { budgetId?: string, categoryId?: string, transactionIds?: string[], analysisDate: string }
        - status: 'new'
        
        Focus on practical, specific advice based on the data provided.`,
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
  const recommendations = parsed.recommendations || [];

  return recommendations.map((rec: any) => ({
    title: rec.title,
    description: rec.description,
    category: rec.category,
    priority: rec.priority,
    potentialSavings: rec.potentialSavings || 0,
    actionItems: rec.actionItems || [],
    basedOnData: {
      budgetId: rec.basedOnData?.budgetId,
      categoryId: rec.basedOnData?.categoryId,
      transactionIds: rec.basedOnData?.transactionIds || [],
      analysisDate: new Date(),
    },
    status: 'new' as const,
  }));
}

function buildAnalysisPrompt(data: FinancialData): string {
  const { budgets, transactions, categories } = data;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categorySpending = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.categoryId === cat._id && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, spent, type: cat.type };
  });

  const activeBudgets = budgets.filter((b) => b.status === 'active');

  return `
Financial Data Analysis Request:

INCOME & EXPENSES:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Savings: $${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

ACTIVE BUDGETS (${activeBudgets.length}):
${activeBudgets.map((b) => `
- ${b.name} (${b.period})
  Total Income Budget: $${b.totalIncome.toFixed(2)}
  Total Expenses Budget: $${b.totalExpenses.toFixed(2)}
  Health Score: ${b.healthScore || 'N/A'}
  Categories: ${b.categories.length}
`).join('\n')}

SPENDING BY CATEGORY:
${categorySpending
  .filter((c) => c.type === 'expense')
  .sort((a, b) => b.spent - a.spent)
  .slice(0, 10)
  .map((c) => `- ${c.name}: $${c.spent.toFixed(2)}`)
  .join('\n')}

RECENT TRANSACTIONS (last 10):
${transactions
  .slice(-10)
  .map((t) => `- ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)} - ${t.description} (${new Date(t.date).toLocaleDateString()})`)
  .join('\n')}

Please analyze this financial data and provide 3-5 personalized recommendations to improve financial health.
Focus on: reducing unnecessary expenses, increasing savings, optimizing budget allocation, and identifying spending patterns.
Return the response as a JSON object with a "recommendations" array.
`;
}