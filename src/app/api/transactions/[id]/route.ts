import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Transaction, ApiResponse } from '@/types';

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
    const transactionsCollection = db.collection('transactions');

    const transactionDoc = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!transactionDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transaction: Transaction = {
      _id: transactionDoc._id.toString(),
      userId: transactionDoc.userId,
      budgetId: transactionDoc.budgetId,
      categoryId: transactionDoc.categoryId,
      type: transactionDoc.type,
      amount: transactionDoc.amount,
      description: transactionDoc.description,
      date: transactionDoc.date,
      recurring: transactionDoc.recurring,
      recurringFrequency: transactionDoc.recurringFrequency,
      tags: transactionDoc.tags,
      createdAt: transactionDoc.createdAt,
      updatedAt: transactionDoc.updatedAt,
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get transaction error:', error);
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
    const { categoryId, amount, description, date, tags } = body;

    const db = await connectToDatabase();
    const transactionsCollection = db.collection('transactions');
    const categoriesCollection = db.collection('categories');
    const budgetsCollection = db.collection('budgets');

    const transactionDoc = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!transactionDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (categoryId) {
      const category = await categoriesCollection.findOne({
        _id: new ObjectId(categoryId),
        userId: session.userId,
      });

      if (!category) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }

      updateData.categoryId = categoryId;
    }

    if (amount !== undefined) {
      updateData.amount = amount;
    }

    if (description) {
      updateData.description = description;
    }

    if (date) {
      updateData.date = new Date(date);
    }

    if (tags) {
      updateData.tags = tags;
    }

    await transactionsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (transactionDoc.budgetId && (amount !== undefined || categoryId)) {
      const oldAmount = transactionDoc.amount;
      const newAmount = amount !== undefined ? amount : oldAmount;
      const oldCategoryId = transactionDoc.categoryId;
      const newCategoryId = categoryId || oldCategoryId;

      if (oldCategoryId === newCategoryId) {
        const budgetCategory = await budgetsCollection.findOne(
          {
            _id: new ObjectId(transactionDoc.budgetId),
            'categories.categoryId': oldCategoryId,
          },
          { projection: { 'categories.$': 1 } }
        );

        if (budgetCategory && budgetCategory.categories && budgetCategory.categories[0]) {
          const currentSpent = budgetCategory.categories[0].spentAmount || 0;
          const amountDiff = newAmount - oldAmount;
          const newSpent = transactionDoc.type === 'expense' 
            ? currentSpent + amountDiff 
            : currentSpent;

          await budgetsCollection.updateOne(
            {
              _id: new ObjectId(transactionDoc.budgetId),
              'categories.categoryId': oldCategoryId,
            },
            {
              $set: {
                'categories.$.spentAmount': newSpent,
                updatedAt: new Date(),
              },
            }
          );
        }
      } else {
        const oldBudgetCategory = await budgetsCollection.findOne(
          {
            _id: new ObjectId(transactionDoc.budgetId),
            'categories.categoryId': oldCategoryId,
          },
          { projection: { 'categories.$': 1 } }
        );

        if (oldBudgetCategory && oldBudgetCategory.categories && oldBudgetCategory.categories[0]) {
          const currentSpent = oldBudgetCategory.categories[0].spentAmount || 0;
          const newSpent = transactionDoc.type === 'expense' 
            ? currentSpent - oldAmount 
            : currentSpent;

          await budgetsCollection.updateOne(
            {
              _id: new ObjectId(transactionDoc.budgetId),
              'categories.categoryId': oldCategoryId,
            },
            {
              $set: {
                'categories.$.spentAmount': Math.max(0, newSpent),
                updatedAt: new Date(),
              },
            }
          );
        }

        const newBudgetCategory = await budgetsCollection.findOne(
          {
            _id: new ObjectId(transactionDoc.budgetId),
            'categories.categoryId': newCategoryId,
          },
          { projection: { 'categories.$': 1 } }
        );

        if (newBudgetCategory && newBudgetCategory.categories && newBudgetCategory.categories[0]) {
          const currentSpent = newBudgetCategory.categories[0].spentAmount || 0;
          const newSpent = transactionDoc.type === 'expense' 
            ? currentSpent + newAmount 
            : currentSpent;

          await budgetsCollection.updateOne(
            {
              _id: new ObjectId(transactionDoc.budgetId),
              'categories.categoryId': newCategoryId,
            },
            {
              $set: {
                'categories.$.spentAmount': newSpent,
                updatedAt: new Date(),
              },
            }
          );
        }
      }
    }

    const updatedTransactionDoc = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
    });

    const transaction: Transaction = {
      _id: updatedTransactionDoc!._id.toString(),
      userId: updatedTransactionDoc!.userId,
      budgetId: updatedTransactionDoc!.budgetId,
      categoryId: updatedTransactionDoc!.categoryId,
      type: updatedTransactionDoc!.type,
      amount: updatedTransactionDoc!.amount,
      description: updatedTransactionDoc!.description,
      date: updatedTransactionDoc!.date,
      recurring: updatedTransactionDoc!.recurring,
      recurringFrequency: updatedTransactionDoc!.recurringFrequency,
      tags: updatedTransactionDoc!.tags,
      createdAt: updatedTransactionDoc!.createdAt,
      updatedAt: updatedTransactionDoc!.updatedAt,
    };

    return NextResponse.json<ApiResponse<Transaction>>(
      { success: true, data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update transaction error:', error);
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
    const transactionsCollection = db.collection('transactions');
    const budgetsCollection = db.collection('budgets');

    const transactionDoc = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: session.userId,
    });

    if (!transactionDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transactionDoc.budgetId) {
      const budgetCategory = await budgetsCollection.findOne(
        {
          _id: new ObjectId(transactionDoc.budgetId),
          'categories.categoryId': transactionDoc.categoryId,
        },
        { projection: { 'categories.$': 1 } }
      );

      if (budgetCategory && budgetCategory.categories && budgetCategory.categories[0]) {
        const currentSpent = budgetCategory.categories[0].spentAmount || 0;
        const newSpent = transactionDoc.type === 'expense' 
          ? currentSpent - transactionDoc.amount 
          : currentSpent;

        await budgetsCollection.updateOne(
          {
            _id: new ObjectId(transactionDoc.budgetId),
            'categories.categoryId': transactionDoc.categoryId,
          },
          {
            $set: {
              'categories.$.spentAmount': Math.max(0, newSpent),
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    await transactionsCollection.deleteOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json<ApiResponse<never>>(
      { success: true, message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}