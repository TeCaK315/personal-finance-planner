import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import { calculateBalance, calculateCategoryTotals, calculateMonthlyTrends } from '@/lib/calculations';
import type { ApiResponse, DashboardStats, Transaction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const goalsCollection = db.collection('goals');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const allTransactionsDocs = await transactionsCollection
      .find({ userId: user._id })
      .toArray();

    const allTransactions: Transaction[] = allTransactionsDocs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const monthlyTransactionsDocs = await transactionsCollection
      .find({
        userId: user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .toArray();

    const monthlyTransactions: Transaction[] = monthlyTransactionsDocs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const recentTransactionsDocs = await transactionsCollection
      .find({ userId: user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .toArray();

    const recentTransactions: Transaction[] = recentTransactionsDocs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const { totalIncome: currentBalance } = calculateBalance(allTransactions);
    const { totalIncome: monthlyIncome, totalExpenses: monthlyExpenses } = calculateBalance(monthlyTransactions);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const topCategories = calculateCategoryTotals(monthlyTransactions).slice(0, 5);
    const monthlyTrend = calculateMonthlyTrends(allTransactions);

    const activeGoalsCount = await goalsCollection.countDocuments({
      userId: user._id,
      status: 'active',
    });

    const completedGoalsCount = await goalsCollection.countDocuments({
      userId: user._id,
      status: 'completed',
    });

    const stats: DashboardStats = {
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      activeGoals: activeGoalsCount,
      completedGoals: completedGoalsCount,
      recentTransactions,
      topCategories,
      monthlyTrend,
    };

    return NextResponse.json<ApiResponse<DashboardStats>>(
      { success: true, data: stats },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}