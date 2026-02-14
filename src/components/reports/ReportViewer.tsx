'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CategoryBreakdownChart } from '@/components/reports/CategoryBreakdownChart';
import { TrendChart } from '@/components/reports/TrendChart';
import { ExportButton } from '@/components/reports/ExportButton';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { SpendingReport, TrendReport } from '@/types';

interface ReportViewerProps {
  spendingReport?: SpendingReport;
  trendReport?: TrendReport;
  startDate: Date;
  endDate: Date;
}

export function ReportViewer({
  spendingReport,
  trendReport,
  startDate,
  endDate,
}: ReportViewerProps) {
  if (!spendingReport && !trendReport) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <p className="text-gray-500">No report data available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Report</h2>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>
        <ExportButton
          startDate={startDate}
          endDate={endDate}
          reportType={spendingReport ? 'spending' : 'trends'}
        />
      </div>

      {spendingReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(spendingReport.totalIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(spendingReport.totalExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Savings</p>
                    <p
                      className={`text-2xl font-bold ${
                        spendingReport.netSavings >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(spendingReport.netSavings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Spending by Category</h3>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownChart data={spendingReport.categoryBreakdown} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Top Expense Categories</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {spendingReport.topExpenseCategories.map((cat) => (
                  <div key={cat.categoryId} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {cat.categoryName}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(cat.totalAmount)} ({cat.percentage.toFixed(1)}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {trendReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Spending Trends</h3>
              <div className="text-right">
                <p className="text-xs text-gray-500">Avg. Monthly Expense</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(trendReport.averageMonthlyExpense)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    trendReport.trend === 'increasing'
                      ? 'text-red-500'
                      : trendReport.trend === 'decreasing'
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
                >
                  {trendReport.trend === 'increasing' ? '↑' : trendReport.trend === 'decreasing' ? '↓' : '→'}{' '}
                  {Math.abs(trendReport.trendPercentage).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendReport.dataPoints} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}