'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/utils/api-client';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import type { BulkImportResult } from '@/types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/json'];
      if (!validTypes.includes(selectedFile.type)) {
        showToast('Please select a CSV or JSON file', 'error');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast('Please select a file', 'error');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const fileContent = await file.text();
      let transactions;

      if (file.type === 'application/json') {
        transactions = JSON.parse(fileContent);
      } else {
        const lines = fileContent.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim());
        transactions = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return {
            budgetId: obj.budgetId,
            categoryId: obj.categoryId,
            amount: parseFloat(obj.amount),
            type: obj.type,
            description: obj.description,
            date: obj.date,
          };
        });
      }

      const response = await apiClient.post('/api/transactions/bulk', {
        transactions,
      });

      if (response.data.success) {
        setResult(response.data.data);
        if (response.data.data.failed === 0) {
          showToast(
            `Successfully imported ${response.data.data.imported} transactions`,
            'success'
          );
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        } else {
          showToast(
            `Imported ${response.data.data.imported} transactions with ${response.data.data.failed} errors`,
            'warning'
          );
        }
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.error || 'Failed to import transactions',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Import Transactions">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Import multiple transactions from a CSV or JSON file. The file should
            contain the following fields: budgetId, categoryId, amount, type,
            description, date.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV or JSON files only</p>
            </label>
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Successfully imported: {result.imported} transactions
              </p>
            </div>

            {result.failed > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Failed to import: {result.failed} transactions
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-700">
                          Row {error.row}: {error.field} - {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleImport}
            isLoading={isLoading}
            disabled={!file}
          >
            Import Transactions
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}