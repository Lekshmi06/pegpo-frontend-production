import { ComponentType } from 'react';

export interface ResearchTopic {
  id: number | string;
  title: string;
  count: number;
}

export interface ResearchGoal {
  id: number | string;
  title: string;
  date: string;
}

export interface ResearchMenuGroup {
  id: string;
  bgClass: string;
  items: {
    label: string;
    icon: ComponentType<{ className?: string }>;
    path: string;
  }[];
}

export interface ResearchData {
  topics: ResearchTopic[];
  recentGoals: ResearchGoal[];
  createItems: {
    id: string;
    label: string;
  }[];
}
