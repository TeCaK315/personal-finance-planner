'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onChange,
}: DateRangeSelectorProps) {
  const [localStartDate, setLocalStartDate] = useState(
    startDate.toISOString().split('T')[0]
  );
  const [localEndDate, setLocalEndDate] = useState(
    endDate.toISOString().split('T')[0]
  );

  const handleApply = () => {
    onChange(new Date(localStartDate), new Date(localEndDate));
  };

  const setPreset = (preset: string) => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    setLocalStartDate(start.toISOString().split('T')[0]);
    setLocalEndDate(end.toISOString().split('T')[0]);
    onChange(start, end);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPreset('week')}
        >
          Last Week
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPreset('month')}
        >
          Last Month
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPreset('quarter')}
        >
          Last Quarter
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPreset('year')}
        >
          Last Year
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Start Date
          </label>
          <Input
            type="date"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            End Date
          </label>
          <Input
            type="date"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}