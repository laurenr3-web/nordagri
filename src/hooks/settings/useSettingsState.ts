
import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsState {
  hasUnsavedChanges: Record<string, boolean>;
  lastSaved: Record<string, Date | null>;
}

export const useSettingsState = () => {
  const [settingsState, setSettingsState] = useLocalStorage<SettingsState>('settings-state', {
    hasUnsavedChanges: {},
    lastSaved: {}
  });

  const markAsChanged = useCallback((section: string) => {
    setSettingsState(prev => ({
      ...prev,
      hasUnsavedChanges: {
        ...prev.hasUnsavedChanges,
        [section]: true
      }
    }));
  }, [setSettingsState]);

  const markAsSaved = useCallback((section: string) => {
    setSettingsState(prev => ({
      ...prev,
      hasUnsavedChanges: {
        ...prev.hasUnsavedChanges,
        [section]: false
      },
      lastSaved: {
        ...prev.lastSaved,
        [section]: new Date()
      }
    }));
  }, [setSettingsState]);

  const hasAnyUnsavedChanges = Object.values(settingsState.hasUnsavedChanges).some(v => v);

  return {
    hasUnsavedChanges: settingsState.hasUnsavedChanges,
    lastSaved: settingsState.lastSaved,
    markAsChanged,
    markAsSaved,
    hasAnyUnsavedChanges
  };
};
