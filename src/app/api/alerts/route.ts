import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { checkBudgetAlerts } from '@/lib/budget-calculator';
import { BudgetAlert, ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<BudgetAlert[]>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dismissedParam = searchParams.get('dismissed');
    const severity = searchParams.get('severity') as 'info' | 'warning' | 'critical' | null;

    const db = await getDb();
    const alertsCollection = db.collection<BudgetAlert>('alerts');
    const budgetsCollection = db.collection('budgets');
    const transactionsCollection = db.collection('transactions');

    const activeBudgets = await budgetsCollection
      .find({
        userId: session.userId,
        status: 'active'
      })
      .toArray();

    for (const budget of activeBudgets) {
      const budgetTransactions = await transactionsCollection
        .find({
          userId: session.userId,
          budgetId: budget._id.toString(),
          date: {
            $gte: new Date(budget.startDate),
            $lte: new Date(budget.endDate)
          }
        })
        .toArray();

      const newAlerts = await checkBudgetAlerts(budget, budgetTransactions);

      for (const alert of newAlerts) {
        const existingAlert = await alertsCollection.findOne({
          userId: session.userId,
          budgetId: budget._id.toString(),
          categoryId: alert.categoryId,
          type: alert.type,
          dismissed: false
        });

        if (!existingAlert) {
          await alertsCollection.insertOne({
            ...alert,
            userId: session.userId,
            budgetId: budget._id.toString(),
            dismissed: false,
            createdAt: new Date()
          });
        }
      }
    }

    const query: {
      userId: string;
      dismissed?: boolean;
      severity?: string;
    } = {
      userId: session.userId
    };

    if (dismissedParam !== null) {
      query.dismissed = dismissedParam === 'true';
    }

    if (severity && ['info', 'warning', 'critical'].includes(severity)) {
      query.severity = severity;
    }

    const alerts = await alertsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}