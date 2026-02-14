import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { analyzeSpendingPatterns } from '@/lib/openai';
import { Transaction, Budget, SpendingTrend, CategorySpending } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const groupBy = (searchParams.get('groupBy') || 'day') as 'day' | 'week' | 'month';

    const db = await getDb();

    let startDate: Date;
    let endDate: Date;

    if (budgetId) {
      if (!ObjectId.isValid(budgetId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid budget ID' },
          { status: 400 }
        );
      }

      const budget = await db.collection<Budget>('budgets').findOne({
        _id: new ObjectId(budgetId),
        userId: session.userId
      });

      if (!budget) {
        return NextResponse.json(
          { success: false, error: 'Budget not found' },
          { status: 404 }
        );
      }

      startDate = new Date(budget.startDate);
      endDate = new Date(budget.endDate);
    } else {
      if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        endDate = new Date(endDateParam);
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }
    }

    const filter: any = {
      userId: session.userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (budgetId) {
      filter.budgetId = budgetId;
    }

    const transactions = await db.collection<Transaction>('transactions')
      .find(filter)
      .sort({ date: 1 })
      .toArray();

    const trendsMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(transaction => {
      let dateKey: string;
      const transactionDate = new Date(transaction.date);

      if (groupBy === 'day') {
        dateKey = transactionDate.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(transactionDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else {
        dateKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      }

      const existing = trendsMap.get(dateKey) || { income: 0, expenses: 0 };
      
      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }

      trendsMap.set(dateKey, existing);
    });

    const trends: SpendingTrend[] = Array.from(trendsMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const categoryMap = new Map<string, { amount: number; count: number }>();
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    expenseTransactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.categoryName) || { amount: 0, count: 0 };
      categoryMap.set(transaction.categoryName, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });

    const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([categoryName, data]) => ({
        categoryName,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount);

    let insights: string[] = [];

    if (transactions.length > 10) {
      try {
        insights = await analyzeSpendingPatterns({
          transactions,
          trends,
          categoryBreakdown
        });
      } catch (error) {
        console.error('Error generating AI insights:', error);
        insights = [
          'Unable to generate AI insights at this time.',
          `Total expenses: $${totalExpenses.toFixed(2)}`,
          `Number of transactions: ${transactions.length}`
        ];
      }
    } else {
      insights = [
        'Not enough transaction data to generate detailed insights.',
        'Add more transactions to get personalized spending analysis.'
      ];
    }

    return NextResponse.json({
      success: true,
      data: {
        trends,
        categoryBreakdown,
        insights
      }
    });

  } catch (error) {
    console.error('Error fetching spending analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}