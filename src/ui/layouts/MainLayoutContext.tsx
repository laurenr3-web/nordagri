
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Context interface
interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  showContextPanel: boolean;
  setShowContextPanel: (value: boolean) => void;
}

// Create the context
const LayoutContext = createContext<LayoutContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  showContextPanel: false,
  setShowContextPanel: () => {},
});

// Props interface for the provider component
interface LayoutProviderProps {
  children: ReactNode;
}

// Provider component
export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);

  return (
    <LayoutContext.Provider value={{
      sidebarCollapsed,
      setSidebarCollapsed,
      showContextPanel,
      setShowContextPanel
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// Hook for using the context
export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
