
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useToast } from '@/hooks/use-toast';

interface RealtimeCacheContextType {
  isRealtimeEnabled: boolean;
  realtimeStatus: {
    equipment: { status: string | null };
    parts: { status: string | null };
    maintenance: { status: string | null };
    allSubscribed: boolean;
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

  // Initialize realtime status
  useEffect(() => {
    if (realtimeStatus.allSubscribed) {
      console.log('All realtime subscriptions active');
      toast({
        title: 'Synchronisation active',
        description: 'Toutes les données sont synchronisées en temps réel',
      });
    }
  }, [realtimeStatus.allSubscribed, toast]);

  // Configure global cache settings
  useEffect(() => {
    // Set up global query client defaults
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 3,
      },
    });
  }, [queryClient]);

  const value = {
    isRealtimeEnabled: true,
    realtimeStatus,
  };

  return (
    <RealtimeCacheContext.Provider value={value}>
      {children}
    </RealtimeCacheContext.Provider>
  );
}
