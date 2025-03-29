
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';
import { useAuthContext } from '@/providers/AuthProvider';

interface UserSettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: Error | null;
  saveSettings: (newSettings: UserSettings) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuthContext();
  const userId = user?.id || '';
  
  const {
    settings,
    loading,
    error,
    saveSettings,
    resetSettings,
    fetchSettings
  } = useUserSettings(userId);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    settings,
    loading,
    error,
    saveSettings,
    resetSettings,
    refreshSettings: fetchSettings
  }), [settings, loading, error, saveSettings, resetSettings, fetchSettings]);

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext);
  
  if (context === undefined) {
    throw new Error('useUserSettingsContext must be used within a UserSettingsProvider');
  }
  
  return context;
};
