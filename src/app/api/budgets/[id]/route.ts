import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Budget, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    const budgetDoc = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!budgetDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const budget: Budget = {
      _id: budgetDoc._id.toString(),
      userId: budgetDoc.userId,
      name: budgetDoc.name,
      period: budgetDoc.period,
      startDate: budgetDoc.startDate,
      endDate: budgetDoc.endDate,
      categories: budgetDoc.categories,
      totalIncome: budgetDoc.totalIncome,
      totalExpenses: budgetDoc.totalExpenses,
      status: budgetDoc.status,
      healthScore: budgetDoc.healthScore,
      createdAt: budgetDoc.createdAt,
      updatedAt: budgetDoc.updatedAt,
    };

    return NextResponse.json<ApiResponse<Budget>>(
      { success: true, data: budget },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, categories, status } = body;

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');
    const categoriesCollection = db.collection('categories');

    const budgetDoc = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!budgetDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name) {
      updateData.name = name;
    }

    if (status) {
      updateData.status = status;
    }

    if (categories && Array.isArray(categories)) {
      const categoryIds = categories.map((c) => new ObjectId(c.categoryId));
      const categoryDocs = await categoriesCollection
        .find({ _id: { $in: categoryIds }, userId: session.userId })
        .toArray();

      if (categoryDocs.length !== categories.length) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'One or more categories not found' },
          { status: 404 }
        );
      }

      const totalIncome = categories
        .filter((c) => {
          const cat = categoryDocs.find((cd) => cd._id.toString() === c.categoryId);
          return cat?.type === 'income';
        })
        .reduce((sum, c) => sum + c.allocatedAmount, 0);

      const totalExpenses = categories
        .filter((c) => {
          const cat = categoryDocs.find((cd) => cd._id.toString() === c.categoryId);
          return cat?.type === 'expense';
        })
        .reduce((sum, c) => sum + c.allocatedAmount, 0);

      const budgetCategories = categories.map((c) => {
        const cat = categoryDocs.find((cd) => cd._id.toString() === c.categoryId);
        const existingCategory = budgetDoc.categories.find(
          (bc: { categoryId: string }) => bc.categoryId === c.categoryId
        );
        return {
          categoryId: c.categoryId,
          categoryName: cat?.name || '',
          allocatedAmount: c.allocatedAmount,
          spentAmount: existingCategory?.spentAmount || 0,
          percentage: totalExpenses > 0 ? (c.allocatedAmount / totalExpenses) * 100 : 0,
        };
      });

      updateData.categories = budgetCategories;
      updateData.totalIncome = totalIncome;
      updateData.totalExpenses = totalExpenses;
    }

    await budgetsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    const updatedBudgetDoc = await budgetsCollection.findOne({
      _id: new ObjectId(params.id),
    });

    const budget: Budget = {
      _id: updatedBudgetDoc!._id.toString(),
      userId: updatedBudgetDoc!.userId,
      name: updatedBudgetDoc!.name,
      period: updatedBudgetDoc!.period,
      startDate: updatedBudgetDoc!.startDate,
      endDate: updatedBudgetDoc!.endDate,
      categories: updatedBudgetDoc!.categories,
      totalIncome: updatedBudgetDoc!.totalIncome,
      totalExpenses: updatedBudgetDoc!.totalExpenses,
      status: updatedBudgetDoc!.status,
      healthScore: updatedBudgetDoc!.healthScore,
      createdAt: updatedBudgetDoc!.createdAt,
      updatedAt: updatedBudgetDoc!.updatedAt,
    };

    return NextResponse.json<ApiResponse<Budget>>(
      { success: true, data: budget },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    const budgetsCollection = db.collection('budgets');

    const result = await budgetsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: true, message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}