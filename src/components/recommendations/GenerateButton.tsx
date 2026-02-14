'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
}

export function GenerateButton({ onGenerate, size = 'md' }: GenerateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGenerate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      loading={loading}
      disabled={loading}
      size={size}
      variant="primary"
      className="gap-2"
    >
      <Sparkles className="w-5 h-5" />
      Generate AI Recommendations
    </Button>
  );
}