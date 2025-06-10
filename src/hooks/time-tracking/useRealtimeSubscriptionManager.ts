
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

type SubscriptionCallback = (payload: any) => void;

interface SubscriptionConfig {
  table: string;
  event: string;
  callback: SubscriptionCallback;
}

/**
 * Gestionnaire global des souscriptions realtime pour éviter les doublons
 */
class RealtimeSubscriptionManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();

  /**
   * Ajouter une souscription à un canal
   */
  subscribe(config: SubscriptionConfig): () => void {
    const { table, event, callback } = config;
    const channelKey = `${table}_${event}`;
    
    // Ajouter le callback à la liste des callbacks pour ce canal
    if (!this.subscriptions.has(channelKey)) {
      this.subscriptions.set(channelKey, new Set());
    }
    this.subscriptions.get(channelKey)!.add(callback);

    // Si le canal n'existe pas encore, le créer
    if (!this.channels.has(channelKey)) {
      this.createChannel(table, event, channelKey);
    }

    // Retourner une fonction de nettoyage
    return () => {
      this.unsubscribe(channelKey, callback);
    };
  }

  /**
   * Créer un canal Supabase
   */
  private createChannel(table: string, event: string, channelKey: string) {
    logger.log(`Creating realtime channel: ${channelKey}`);
    
    const channel = supabase
      .channel(`${channelKey}_changes`)
      .on('postgres_changes', 
        {
          event: event as any,
          schema: 'public',
          table: table
        }, 
        (payload) => {
          // Notifier tous les callbacks enregistrés pour ce canal
          const callbacks = this.subscriptions.get(channelKey);
          if (callbacks) {
            callbacks.forEach(callback => {
              try {
                callback(payload);
              } catch (error) {
                logger.error(`Error in realtime callback for ${channelKey}:`, error);
              }
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.log(`Successfully subscribed to ${channelKey}`);
        } else if (status === 'CHANNEL_ERROR') {
          logger.error(`Subscription error for ${channelKey}: ${status}`);
          this.cleanupChannel(channelKey);
        } else if (status === 'TIMED_OUT') {
          logger.warn(`Subscription timed out for ${channelKey}`);
          this.cleanupChannel(channelKey);
        }
      });

    this.channels.set(channelKey, channel);
  }

  /**
   * Désabonner un callback spécifique
   */
  private unsubscribe(channelKey: string, callback: SubscriptionCallback) {
    const callbacks = this.subscriptions.get(channelKey);
    if (callbacks) {
      callbacks.delete(callback);
      
      // Si plus aucun callback n'est enregistré, nettoyer le canal
      if (callbacks.size === 0) {
        this.cleanupChannel(channelKey);
      }
    }
  }

  /**
   * Nettoyer un canal
   */
  private cleanupChannel(channelKey: string) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      logger.log(`Cleaning up realtime channel: ${channelKey}`);
      supabase.removeChannel(channel);
      this.channels.delete(channelKey);
      this.subscriptions.delete(channelKey);
    }
  }

  /**
   * Nettoyer tous les canaux
   */
  cleanup() {
    this.channels.forEach((channel, key) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscriptions.clear();
  }
}

// Instance globale du gestionnaire
const subscriptionManager = new RealtimeSubscriptionManager();

/**
 * Hook pour gérer les souscriptions realtime avec déduplication
 */
export function useRealtimeSubscriptionManager() {
  const cleanupRef = useRef<(() => void)[]>([]);

  const subscribe = (config: SubscriptionConfig) => {
    const unsubscribe = subscriptionManager.subscribe(config);
    cleanupRef.current.push(unsubscribe);
    return unsubscribe;
  };

  useEffect(() => {
    return () => {
      // Nettoyer toutes les souscriptions de ce hook
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return { subscribe };
}

// Nettoyer lors du déchargement de la page
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.cleanup();
  });
}
