'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/utils/api-client';
import { Download, FileText, File } from 'lucide-react';

interface ExportButtonProps {
  startDate: Date;
  endDate: Date;
  reportType: 'spending' | 'trends';
  categoryIds?: string[];
  budgetId?: string;
}

export function ExportButton({
  startDate,
  endDate,
  reportType,
  categoryIds,
  budgetId,
}: ExportButtonProps) {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const response = await apiClient.post(
        '/api/reports/export',
        {
          reportType,
          format,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          categoryIds,
          budgetId,
        },
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], {
        type:
          format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-report-${reportType}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(`Report exported as ${format.toUpperCase()}`, 'success');
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to export report',
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setShowMenu(!showMenu)}
        isLoading={isExporting}
      >
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg"
            >
              <FileText className="w-4 h-4" />
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors last:rounded-b-lg"
            >
              <File className="w-4 h-4" />
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}