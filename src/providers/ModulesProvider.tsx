
import React, { createContext, useContext, ReactNode } from 'react';
import { FarmModules, defaultModules, useFarmModules } from '@/hooks/settings/useFarmModules';

interface ModulesContextType {
  modules: FarmModules;
  isLoading: boolean;
  canAccess: (module: keyof FarmModules) => boolean;
}

const ModulesContext = createContext<ModulesContextType>({
  modules: defaultModules,
  isLoading: true,
  canAccess: () => true,
});

export const useModules = () => useContext(ModulesContext);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { modules, isLoading } = useFarmModules();
  
  const canAccess = (module: keyof FarmModules) => {
    return modules[module] === true;
  };
  
  return (
    <ModulesContext.Provider value={{ modules, isLoading, canAccess }}>
      {children}
    </ModulesContext.Provider>
  );
}
