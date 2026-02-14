import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { Transaction, Budget } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transactionId = params.id;
    if (!ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const transaction = await db.collection<Transaction>('transactions').findOne({
      _id: new ObjectId(transactionId),
      userId: session.userId
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transactionId = params.id;
    if (!ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount, categoryId, categoryName, description, date } = body;

    const db = await getDb();

    const existingTransaction = await db.collection<Transaction>('transactions').findOne({
      _id: new ObjectId(transactionId),
      userId: session.userId
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (amount !== undefined) {
      updateData.amount = amount;
    }
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }
    if (categoryName !== undefined) {
      updateData.categoryName = categoryName;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (date !== undefined) {
      updateData.date = new Date(date);
    }

    if (existingTransaction.type === 'expense' && (amount !== undefined || categoryId !== undefined)) {
      const oldAmount = existingTransaction.amount;
      const newAmount = amount !== undefined ? amount : oldAmount;
      const oldCategoryId = existingTransaction.categoryId;
      const newCategoryId = categoryId !== undefined ? categoryId : oldCategoryId;

      if (oldCategoryId === newCategoryId) {
        const amountDiff = newAmount - oldAmount;
        await db.collection<Budget>('budgets').updateOne(
          {
            _id: new ObjectId(existingTransaction.budgetId),
            'categories.categoryId': oldCategoryId
          },
          {
            $inc: { 'categories.$.spentAmount': amountDiff },
            $set: { updatedAt: new Date() }
          }
        );
      } else {
        await db.collection<Budget>('budgets').updateOne(
          {
            _id: new ObjectId(existingTransaction.budgetId),
            'categories.categoryId': oldCategoryId
          },
          {
            $inc: { 'categories.$.spentAmount': -oldAmount },
            $set: { updatedAt: new Date() }
          }
        );

        await db.collection<Budget>('budgets').updateOne(
          {
            _id: new ObjectId(existingTransaction.budgetId),
            'categories.categoryId': newCategoryId
          },
          {
            $inc: { 'categories.$.spentAmount': newAmount },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    await db.collection<Transaction>('transactions').updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: updateData }
    );

    const updatedTransaction = await db.collection<Transaction>('transactions').findOne({
      _id: new ObjectId(transactionId)
    });

    return NextResponse.json({
      success: true,
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
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
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transactionId = params.id;
    if (!ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const transaction = await db.collection<Transaction>('transactions').findOne({
      _id: new ObjectId(transactionId),
      userId: session.userId
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.type === 'expense') {
      await db.collection<Budget>('budgets').updateOne(
        {
          _id: new ObjectId(transaction.budgetId),
          'categories.categoryId': transaction.categoryId
        },
        {
          $inc: { 'categories.$.spentAmount': -transaction.amount },
          $set: { updatedAt: new Date() }
        }
      );
    }

    await db.collection<Transaction>('transactions').deleteOne({
      _id: new ObjectId(transactionId)
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}