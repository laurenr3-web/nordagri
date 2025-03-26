
import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types d'événements valides pour Supabase Realtime
type SupabaseEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Interface générique pour les données de la table
interface SubscriptionConfig<T> {
  tableName: string;
  eventTypes?: SupabaseEventType[];
  schema?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  filter?: string;
  showNotifications?: boolean;
}

/**
 * Hook personnalisé pour s'abonner aux changements en temps réel d'une table Supabase
 */
export function useRealtimeSubscription<T extends Record<string, any>>({
  tableName,
  eventTypes = ['*'],
  schema = 'public',
  onInsert,
  onUpdate,
  onDelete,
  filter,
  showNotifications = true,
}: SubscriptionConfig<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast: showToast } = toast();

  useEffect(() => {
    // Création d'un nouveau canal
    let subscription = supabase.channel(`table-changes-${tableName}`);
    
    // Configuration des filtres de base
    const filterConfig: {
      schema: string;
      table: string;
      event: SupabaseEventType | SupabaseEventType[];
      filter?: string;
    } = {
      schema: schema,
      table: tableName,
      event: eventTypes.length === 1 ? eventTypes[0] : eventTypes,
    };
    
    // Ajout du filtre optionnel
    if (filter) {
      filterConfig.filter = filter;
    }
    
    // Abonnement aux changements PostgreSQL
    subscription = subscription.on(
      'postgres_changes',
      filterConfig,
      (payload: RealtimePostgresChangesPayload<T>) => {
        // Traitement selon le type d'événement
        if (payload.eventType === 'INSERT') {
          if (onInsert) onInsert(payload);
          if (showNotifications) {
            showToast({
              title: `Nouvel élément ajouté`,
              description: `Un nouvel élément a été ajouté dans ${tableName}`,
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          if (onUpdate) onUpdate(payload);
          if (showNotifications) {
            showToast({
              title: `Élément mis à jour`,
              description: `Un élément a été mis à jour dans ${tableName}`,
            });
          }
        } else if (payload.eventType === 'DELETE') {
          if (onDelete) onDelete(payload);
          if (showNotifications) {
            showToast({
              title: `Élément supprimé`,
              description: `Un élément a été supprimé de ${tableName}`,
              variant: "destructive",
            });
          }
        }
      }
    );

    // Subscribe au canal et configuration des callbacks
    subscription
      .subscribe()
      .then((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          console.log(`Abonné aux changements de la table ${tableName}`);
        }
      })
      .catch((err: Error) => {
        console.error(`Erreur d'abonnement à la table ${tableName}:`, err);
        setError(err);
      });

    // Stockage du canal pour accès ultérieur
    setChannel(subscription);

    // Nettoyage à la destruction du composant
    return () => {
      supabase.removeChannel(subscription);
      console.log(`Désabonnement des changements de la table ${tableName}`);
    };
  }, [tableName, JSON.stringify(eventTypes), schema, filter, showNotifications]);

  return { channel, isSubscribed, error };
}
