'use client';

import { useEffect, useState } from 'react';
import { FinancialGoal } from '@/types';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setGoals(data.data);
      } else {
        setError(data.error || 'Failed to fetch goals');
      }
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleGoalCreated = () => {
    setShowModal(false);
    fetchGoals();
  };

  const handleGoalUpdated = () => {
    fetchGoals();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-slow text-primary text-xl">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Goals</h1>
          <p className="text-text/70">Track and achieve your financial objectives</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>

      {error && (
        <Card>
          <div className="p-6 text-center text-red-400">{error}</div>
        </Card>
      )}

      {goals.length === 0 && !error ? (
        <Card>
          <div className="p-12 text-center">
            <p className="text-text/70 mb-4">No goals yet. Create your first financial goal!</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onUpdate={handleGoalUpdated} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Goal">
        <GoalForm onSuccess={handleGoalCreated} />
      </Modal>
    </div>
  );
}