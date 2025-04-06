
import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface RealtimeCacheContextType {
  isRealtimeEnabled: boolean;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  realtimeStatus: {
    equipment: { isSubscribed: boolean; error: Error | null };
    parts: { isSubscribed: boolean; error: Error | null };
    maintenance: { isSubscribed: boolean; error: Error | null };
    interventions: { isSubscribed: boolean; error: Error | null };
    allSubscribed: boolean;
    hasError: boolean;
  };
  prefetchCriticalData: () => Promise<void>;
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Détecter automatiquement l'état de la connexion
  useEffect(() => {
    const handleConnectionChange = () => {
      const isOffline = !navigator.onLine;
      if (isOffline !== isOfflineMode) {
        setIsOfflineMode(isOffline);
        if (isOffline) {
          toast({
            title: 'Mode hors ligne activé',
            description: 'Vous utilisez maintenant l\'application en mode hors ligne',
          });
        } else {
          toast({
            title: 'Connexion rétablie',
            description: 'Synchronisation des données en cours...',
          });
          // Invalider les requêtes lorsque la connexion est de retour
          queryClient.invalidateQueries();
        }
      }
    };

    // Vérifier l'état initial
    handleConnectionChange();
    
    // S'abonner aux événements de connexion
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, [isOfflineMode, queryClient, toast]);

  // Initialiser l'application et les réglages du cache
  useEffect(() => {
    // Configurer les paramètres globaux du cache
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (anciennement cacheTime)
        refetchOnWindowFocus: false, // Désactivé pour réduire les rechargements inutiles
        refetchOnReconnect: true,
        retry: 2, // Moins de tentatives pour éviter de surcharger
        refetchInterval: false, // Désactiver le refetch automatique
      },
    });
    
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

  // Fonction pour précharger les données critiques
  const prefetchCriticalData = useCallback(async () => {
    try {
      toast({
        title: 'Préchargement des données',
        description: 'Chargement des données essentielles...',
      });
      
      // Précharger les données essentielles
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['equipment'],
          queryFn: async () => {
            const { getEquipment } = await import('@/services/supabase/equipment/queries');
            return getEquipment();
          }
        }),
        queryClient.prefetchQuery({
          queryKey: ['parts'],
          queryFn: async () => {
            const { getParts } = await import('@/services/supabase/parts');
            return getParts();
          }
        })
      ]);
      
      toast({
        title: 'Données prêtes',
        description: 'Les données essentielles sont disponibles hors ligne',
      });
    } catch (error) {
      console.error('Erreur lors du préchargement des données:', error);
      toast({
        title: 'Erreur de préchargement',
        description: 'Impossible de précharger toutes les données',
        variant: 'destructive',
      });
    }
  }, [queryClient, toast]);

  // Basculer manuellement entre le mode en ligne et hors ligne
  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode(prev => {
      const newValue = !prev;
      if (newValue) {
        // Entrer en mode hors ligne
        prefetchCriticalData();
      } else {
        // Sortir du mode hors ligne
        queryClient.invalidateQueries();
      }
      return newValue;
    });
  }, [prefetchCriticalData, queryClient]);

  const value: RealtimeCacheContextType = {
    isRealtimeEnabled: true,
    isOfflineMode,
    toggleOfflineMode,
    realtimeStatus,
    prefetchCriticalData,
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
