import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<void>>> {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid alert ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const alertsCollection = db.collection('alerts');

    const alert = await alertsCollection.findOne({
      _id: new ObjectId(id),
      userId: session.userId
    });

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    await alertsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { dismissed: true } }
    );

    return NextResponse.json({
      success: true,
      message: 'Alert dismissed successfully'
    });

  } catch (error) {
    console.error('Dismiss alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss alert' },
      { status: 500 }
    );
  }
}