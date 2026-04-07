
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
    defaultWidgets,
    // Merge: inject any new default widgets missing from saved layout
    (saved) => {
      const savedIds = new Set(saved.map(w => w.id));
      const missing = defaultWidgets.filter(w => !savedIds.has(w.id));
      if (missing.length === 0) return saved;
      // Insert missing widgets after 'stats' (index 0) or at the start
      const statsIdx = saved.findIndex(w => w.id === 'stats');
      const insertIdx = statsIdx >= 0 ? statsIdx + 1 : 0;
      const merged = [...saved];
      merged.splice(insertIdx, 0, ...missing);
      return merged;
    }
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
