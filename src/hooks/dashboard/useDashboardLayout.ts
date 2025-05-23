
import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  enabled: boolean;
}

export const useDashboardLayout = (defaultWidgets: WidgetConfig[]) => {
  const [widgets, setWidgets] = useLocalStorage<WidgetConfig[]>(
    'dashboard-layout',
    defaultWidgets
  );

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  }, [setWidgets]);

  const addWidget = useCallback((widget: WidgetConfig) => {
    setWidgets(prev => [...prev, widget]);
  }, [setWidgets]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, enabled: false } : widget
    ));
  }, [setWidgets]);

  const reorderWidgets = useCallback((newOrder: WidgetConfig[]) => {
    setWidgets(newOrder);
  }, [setWidgets]);

  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
  }, [defaultWidgets, setWidgets]);

  return {
    widgets,
    updateWidget,
    addWidget,
    removeWidget,
    reorderWidgets,
    resetLayout
  };
};
