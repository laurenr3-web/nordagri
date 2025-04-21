
import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface RealtimeCacheContextType {
  isRealtimeEnabled: boolean;
  realtimeStatus: {
    equipment: { isSubscribed: boolean; error: Error | null };
    parts: { isSubscribed: boolean; error: Error | null };
    maintenance: { isSubscribed: boolean; error: Error | null };
    interventions: { isSubscribed: boolean; error: Error | null };
    allSubscribed: boolean;
    hasError: boolean;
  };
}

const RealtimeCacheContext = createContext<RealtimeCacheContextType | undefined>(undefined);

export function useRealtimeCache() {
  const context = useContext(RealtimeCacheContext);
  if (!context) {
    throw new Error('useRealtimeCache must be used within a RealtimeCacheProvider');
  }
  return context;
}

interface RealtimeCacheProviderProps {
  children: ReactNode;
}

export function RealtimeCacheProvider({ children }: RealtimeCacheProviderProps) {
  const realtimeStatus = useSupabaseRealtime();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialiser l'application et les réglages du cache
  useEffect(() => {
    // We don't need to set default options here anymore since it's done in App.tsx
    // This avoids duplicate configuration
    
    // Simuler un temps d'initialisation
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [queryClient]);

  // Notification lorsque la connexion en temps réel est perdue puis récupérée
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: 'Connexion rétablie',
        description: 'Synchronisation des données en cours...',
      });
      // Invalider sélectivement les données qui peuvent être périmées
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      toast({
        title: 'Connexion perdue',
        description: 'Certaines fonctionnalités peuvent être limitées',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, queryClient]);

  const value: RealtimeCacheContextType = {
    isRealtimeEnabled: true,
    realtimeStatus,
  };

  // Afficher un écran de chargement pendant l'initialisation
  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Initialisation de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <RealtimeCacheContext.Provider value={value}>
      {children}
    </RealtimeCacheContext.Provider>
  );
}
