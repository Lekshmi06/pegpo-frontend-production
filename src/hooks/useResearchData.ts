import { useState, useEffect, useCallback } from 'react';
import { ResearchData } from '../types/research';
import { researchService } from '../services/researchService';
import { AsyncStatus } from '../types/common';

export function useResearchData() {
  const [data, setData] = useState<ResearchData | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchResearchData = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await researchService.getResearchData();
      setData(res);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research data');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchResearchData();
  }, [fetchResearchData]);

  const addGoal = async (title: string) => {
    try {
      const goal = await researchService.addGoal(title);
      setData((prev) => (prev ? { ...prev, recentGoals: [goal, ...prev.recentGoals] } : null));
      return goal;
    } catch (err) {
      throw err;
    }
  };

  return { data, status, error, refetch: fetchResearchData, addGoal, isLoading: status === 'loading' };
}
