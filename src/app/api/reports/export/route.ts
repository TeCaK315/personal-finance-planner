import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import { exportReportToPDF, generateSpendingReport, generateTrendAnalysis } from '@/lib/report-generator';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportType, format, startDate, endDate, categoryIds, budgetId } = body;

    if (!reportType || !format || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    let report;
    if (reportType === 'spending') {
      report = await generateSpendingReport(
        db,
        payload.userId,
        new Date(startDate),
        new Date(endDate),
        categoryIds,
        budgetId
      );
    } else if (reportType === 'trends') {
      report = await generateTrendAnalysis(
        db,
        payload.userId,
        new Date(startDate),
        new Date(endDate),
        categoryIds,
        budgetId
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid report type' },
        { status: 400 }
      );
    }

    if (format === 'pdf') {
      const pdfBuffer = await exportReportToPDF(report, reportType);
      
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportType}-report-${Date.now()}.pdf"`,
        },
      });
    } else if (format === 'csv') {
      let csvContent = '';
      
      if (reportType === 'spending') {
        csvContent = 'Category,Amount,Transaction Count,Percentage\n';
        report.categoryBreakdown.forEach((cat: { categoryName: string; totalAmount: number; transactionCount: number; percentage: number }) => {
          csvContent += `${cat.categoryName},${cat.totalAmount},${cat.transactionCount},${cat.percentage}\n`;
        });
      } else {
        csvContent = 'Date,Income,Expenses,Net Savings\n';
        report.dataPoints.forEach((point: { date: Date; income: number; expenses: number; netSavings: number }) => {
          csvContent += `${point.date.toISOString()},${point.income},${point.expenses},${point.netSavings}\n`;
        });
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${Date.now()}.csv"`,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}