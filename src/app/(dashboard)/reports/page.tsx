'use client';

import React, { useState } from 'react';
import { useSpendingReport, useTrendReport } from '@/hooks/useReports';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { CategoryBreakdownChart } from '@/components/reports/CategoryBreakdownChart';
import { TrendChart } from '@/components/reports/TrendChart';
import { ExportButton } from '@/components/reports/ExportButton';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { FileText, TrendingUp, PieChart } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [activeTab, setActiveTab] = useState<'spending' | 'trends'>('spending');

  const { report: spendingReport, isLoading: spendingLoading, generate: generateSpending } = useSpendingReport();
  const { report: trendReport, isLoading: trendLoading, generate: generateTrend } = useTrendReport();

  const handleGenerateReport = () => {
    if (activeTab === 'spending') {
      generateSpending(dateRange);
    } else {
      generateTrend(dateRange);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Reports</h1>
          <p className="text-slate-400">Analyze your spending patterns and trends</p>
        </div>
        <ExportButton
          reportType={activeTab}
          dateRange={dateRange}
          disabled={!spendingReport && !trendReport}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <DateRangeSelector
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
            />
            <Button variant="primary" onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('spending')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'spending'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <PieChart className="w-4 h-4 inline mr-2" />
          Spending Report
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'trends'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Trend Analysis
        </button>
      </div>

      {activeTab === 'spending' && (
        <>
          {spendingLoading ? (
            <Skeleton className="h-96" />
          ) : spendingReport ? (
            <div className="space-y-6">
              <ReportViewer report={spendingReport} type="spending" />
              <CategoryBreakdownChart data={spendingReport.categoryBreakdown} />
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-400 text-lg">Select a date range and generate a report</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'trends' && (
        <>
          {trendLoading ? (
            <Skeleton className="h-96" />
          ) : trendReport ? (
            <div className="space-y-6">
              <ReportViewer report={trendReport} type="trends" />
              <TrendChart data={trendReport.dataPoints} />
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-400 text-lg">Select a date range and generate a report</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}