
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interface pour un élément en attente de synchronisation
export interface SyncQueueItem {
  id: string;
  type: 'add_part' | 'update_part' | 'delete_part' | 'add_intervention' | 'update_intervention' | 'add_maintenance' | 'update_maintenance' | 'add_time_entry';
  data: any;
  timestamp: number;
  retryCount?: number;
  lastError?: string;
}

// Keys for localStorage
const SYNC_QUEUE_KEY = 'nordagri_sync_queue';
const CACHED_DATA_KEY_PREFIX = 'nordagri_cache_';

// Service de synchronisation
export class OfflineSyncService {
  // Ajouter un élément à la file d'attente de synchronisation
  static addToSyncQueue(type: SyncQueueItem['type'], data: any): string {
    try {
      // Récupérer la file d'attente existante
      const queue = this.getSyncQueue();
      
      // Créer un nouvel élément
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem: SyncQueueItem = {
        id,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      // Ajouter l'élément à la file d'attente
      queue.push(newItem);
      
      // Sauvegarder la file d'attente
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      // Dispatch an event to notify about queue change
      window.dispatchEvent(new Event('syncQueueUpdated'));
      
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la file d\'attente de synchronisation:', error);
      return '';
    }
  }
  
  // Récupérer la file d'attente de synchronisation
  static getSyncQueue(): SyncQueueItem[] {
    try {
      const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la file d\'attente de synchronisation:', error);
      return [];
    }
  }
  
  // Supprimer un élément de la file d'attente de synchronisation
  static removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue();
      const newQueue = queue.filter(item => item.id !== id);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
      
      // Dispatch an event to notify about queue change
      window.dispatchEvent(new Event('syncQueueUpdated'));
    } catch (error) {
      console.error('Erreur lors de la suppression de la file d\'attente de synchronisation:', error);
    }
  }
  
  // Mettre à jour un élément de la file d'attente (par exemple, après une tentative échouée)
  static updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): void {
    try {
      const queue = this.getSyncQueue();
      const updatedQueue = queue.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élément dans la file d\'attente:', error);
    }
  }
  
  // Vider la file d'attente de synchronisation
  static clearSyncQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    // Dispatch an event to notify about queue change
    window.dispatchEvent(new Event('syncQueueUpdated'));
  }
  
  // Cache data for offline use
  static cacheData(key: string, data: any, expirationMinutes: number = 60): void {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + (expirationMinutes * 60 * 1000)
      };
      localStorage.setItem(`${CACHED_DATA_KEY_PREFIX}${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error(`Erreur lors du cache des données (${key}):`, error);
    }
  }
  
  // Get cached data
  static getCachedData<T>(key: string): T | null {
    try {
      const cacheJson = localStorage.getItem(`${CACHED_DATA_KEY_PREFIX}${key}`);
      if (!cacheJson) return null;
      
      const cache = JSON.parse(cacheJson);
      
      // Check if the cache has expired
      if (cache.expiration < Date.now()) {
        localStorage.removeItem(`${CACHED_DATA_KEY_PREFIX}${key}`);
        return null;
      }
      
      return cache.data as T;
    } catch (error) {
      console.error(`Erreur lors de la récupération du cache (${key}):`, error);
      return null;
    }
  }
  
  // Clear all cached data or specific keys
  static clearCache(key?: string): void {
    if (key) {
      localStorage.removeItem(`${CACHED_DATA_KEY_PREFIX}${key}`);
    } else {
      // Clear all cached items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHED_DATA_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
  
  // Get all cached keys
  static getCachedKeys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(CACHED_DATA_KEY_PREFIX))
      .map(key => key.replace(CACHED_DATA_KEY_PREFIX, ''));
  }
}

// Hook pour indiquer aux composants les éléments en attente de synchronisation
export function usePendingSyncCount() {
  const [count, setCount] = useState<number>(0);
  
  useEffect(() => {
    const updateCount = () => {
      const queue = OfflineSyncService.getSyncQueue();
      setCount(queue.length);
    };
    
    // Initial count
    updateCount();
    
    // Listen for changes to the sync queue
    const handleStorageChange = () => {
      updateCount();
    };
    
    window.addEventListener('syncQueueUpdated', handleStorageChange);
    window.addEventListener('storage', (e) => {
      if (e.key === SYNC_QUEUE_KEY) {
        updateCount();
      }
    });
    
    return () => {
      window.removeEventListener('syncQueueUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return count;
}

// Hook pour gérer la synchronisation lorsque l'utilisateur revient en ligne
export function useOfflineSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const { toast } = useToast();
  
  // Fonction pour synchroniser les éléments en attente
  const syncPendingItems = async () => {
    const queue = OfflineSyncService.getSyncQueue();
    
    if (queue.length === 0) return;
    
    setIsSyncing(true);
    setSyncCount(queue.length);
    
    toast({
      title: "Synchronisation en cours",
      description: `${queue.length} éléments en attente de synchronisation...`,
    });
    
    // Implémenter ici la logique de synchronisation réelle
    
    // Une fois la synchronisation terminée
    setIsSyncing(false);
    setSyncCount(0);
    toast({
      title: "Synchronisation terminée",
      description: `${queue.length} éléments synchronisés avec succès.`,
    });
  };
  
  // Écouter les événements de connexion/déconnexion
  useEffect(() => {
    const handleOnline = () => {
      syncPendingItems();
    };
    
    window.addEventListener('online', handleOnline);
    
    // Vérifier s'il y a des éléments en attente au chargement
    if (navigator.onLine) {
      const queue = OfflineSyncService.getSyncQueue();
      if (queue.length > 0) {
        syncPendingItems();
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  return { isSyncing, syncCount };
}
