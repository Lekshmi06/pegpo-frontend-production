import { ResearchData } from '../types/research';
import { researchData } from '../data/mockData';

export const researchService = {
  getResearchData: async (): Promise<ResearchData> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...researchData };
  },

  addGoal: async (title: string): Promise<{ id: number; title: string; date: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newGoal = {
      id: Date.now(),
      title,
      date: 'Just now',
    };
    researchData.recentGoals.unshift(newGoal);
    return newGoal;
  },
};
