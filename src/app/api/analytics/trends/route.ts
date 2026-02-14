import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { SpendingTrend, ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SpendingTrend[]>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const groupBy = (searchParams.get('groupBy') || 'day') as 'day' | 'week' | 'month';

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const categoriesCollection = db.collection('categories');

    const transactions = await transactionsCollection
      .find({
        userId: session.userId,
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: 1 })
      .toArray();

    const categories = await categoriesCollection
      .find({ userId: session.userId })
      .toArray();

    const categoryMap = new Map(
      categories.map(cat => [cat._id.toString(), cat.name])
    );

    const trendsMap = new Map<string, {
      income: number;
      expenses: number;
      categoryTotals: Map<string, number>;
    }>();

    const getDateKey = (date: Date): string => {
      if (groupBy === 'day') {
        return date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    };

    for (const txn of transactions) {
      const dateKey = getDateKey(new Date(txn.date));
      
      if (!trendsMap.has(dateKey)) {
        trendsMap.set(dateKey, {
          income: 0,
          expenses: 0,
          categoryTotals: new Map()
        });
      }

      const trend = trendsMap.get(dateKey)!;

      if (txn.type === 'income') {
        trend.income += txn.amount;
      } else {
        trend.expenses += txn.amount;
        
        const currentTotal = trend.categoryTotals.get(txn.categoryId) || 0;
        trend.categoryTotals.set(txn.categoryId, currentTotal + txn.amount);
      }
    }

    const trends: SpendingTrend[] = Array.from(trendsMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses,
        categories: Array.from(data.categoryTotals.entries())
          .map(([categoryId, amount]) => ({
            categoryId,
            categoryName: categoryMap.get(categoryId) || 'Unknown',
            amount
          }))
          .sort((a, b) => b.amount - a.amount)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: trends
    });

  } catch (error) {
    console.error('Get spending trends error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch spending trends' },
      { status: 500 }
    );
  }
}