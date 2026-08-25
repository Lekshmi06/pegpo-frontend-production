import { ComponentType, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface CreateAction {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface QuickLink {
  id: string;
  title: string;
  img: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
