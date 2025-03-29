
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { toast } from 'sonner';

// Define the shape of our context
interface RealtimeCacheContextType {
  // Track subscriptions status for different resources
  subscriptions: {
    equipment: { isSubscribed: boolean; error: Error | null };
    parts: { isSubscribed: boolean; error: Error | null };
    maintenance: { isSubscribed: boolean; error: Error | null };
    interventions: { isSubscribed: boolean; error: Error | null };
    allSubscribed: boolean;
  };
}

// Create context with default values
const RealtimeCacheContext = createContext<RealtimeCacheContextType>({
  subscriptions: {
    equipment: { isSubscribed: false, error: null },
    parts: { isSubscribed: false, error: null },
    maintenance: { isSubscribed: false, error: null },
    interventions: { isSubscribed: false, error: null },
    allSubscribed: false,
  },
});

// Provider component
export const RealtimeCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the custom hook to set up realtime subscriptions
  const realtimeStatus = useSupabaseRealtime();
  
  // Show toast notification when everything is successfully connected
  useEffect(() => {
    if (realtimeStatus.allSubscribed) {
      console.log('✅ Successfully connected to Supabase');
      toast.success('Connecté au serveur', {
        description: 'Vous recevrez les mises à jour en temps réel',
        duration: 3000,
      });
    }
  }, [realtimeStatus.allSubscribed]);
  
  // Show error notification if any subscription fails
  useEffect(() => {
    const errors = [
      realtimeStatus.equipment.error,
      realtimeStatus.parts.error,
      realtimeStatus.maintenance.error,
      realtimeStatus.interventions.error,
    ].filter(Boolean);
    
    if (errors.length > 0) {
      console.error('⚠️ Error connecting to realtime:', errors);
      toast.error('Problème de connexion', {
        description: 'Certaines mises à jour en temps réel peuvent être indisponibles',
      });
    }
  }, [
    realtimeStatus.equipment.error, 
    realtimeStatus.parts.error,
    realtimeStatus.maintenance.error,
    realtimeStatus.interventions.error
  ]);

  // Context value
  const contextValue = {
    subscriptions: {
      equipment: { 
        isSubscribed: realtimeStatus.equipment.isSubscribed,
        error: realtimeStatus.equipment.error || null
      },
      parts: realtimeStatus.parts,
      maintenance: realtimeStatus.maintenance,
      interventions: realtimeStatus.interventions,
      allSubscribed: realtimeStatus.allSubscribed
    },
  };

  return (
    <RealtimeCacheContext.Provider value={contextValue}>
      {children}
    </RealtimeCacheContext.Provider>
  );
};

// Custom hook to use the context
export const useRealtimeCache = () => useContext(RealtimeCacheContext);
