'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Sparkles } from 'lucide-react';

export function GenerateButton() {
  const { generateRecommendations } = useRecommendations();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await generateRecommendations(true);
    setLoading(false);
  };

  return (
    <Button variant="accent" onClick={handleGenerate} loading={loading}>
      <Sparkles className="w-5 h-5 mr-2" />
      Generate New Recommendations
    </Button>
  );
}