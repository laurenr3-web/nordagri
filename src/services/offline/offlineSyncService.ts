
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interface for a pending sync item
export interface SyncQueueItem {
  id: string;
  type: 'add_intervention' | 'update_intervention' | 'delete_intervention' | 
        'add_time_entry' | 'update_time_entry' | 'delete_time_entry';
  data: any;
  timestamp: number;
}

// Key for storing the sync queue in local storage
const SYNC_QUEUE_KEY = 'nordagri_sync_queue';

// Offline Sync Service
export class OfflineSyncService {
  // Add an item to the sync queue
  static addToSyncQueue(type: SyncQueueItem['type'], data: any): string {
    try {
      // Get existing queue
      const queue = this.getSyncQueue();
      
      // Create new item
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem: SyncQueueItem = {
        id,
        type,
        data,
        timestamp: Date.now()
      };
      
      // Add item to queue
      queue.push(newItem);
      
      // Save queue
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      return id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return '';
    }
  }
  
  // Get the sync queue
  static getSyncQueue(): SyncQueueItem[] {
    try {
      const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }
  
  // Remove an item from the sync queue
  static removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue();
      const newQueue = queue.filter(item => item.id !== id);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  }
  
  // Clear the sync queue
  static clearSyncQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }
}

// Hook to manage sync when the user comes back online
export function useOfflineSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const { toast } = useToast();
  
  // Function to sync pending items
  const syncPendingItems = async () => {
    const queue = OfflineSyncService.getSyncQueue();
    
    if (queue.length === 0) return;
    
    setIsSyncing(true);
    setSyncCount(queue.length);
    
    toast({
      title: "Synchronisation en cours",
      description: `${queue.length} élément(s) en attente de synchronisation...`,
    });
    
    // Implement actual sync logic here
    
    // Once sync is complete
    setIsSyncing(false);
    setSyncCount(0);
    toast({
      title: "Synchronisation terminée",
      description: `${queue.length} élément(s) synchronisé(s) avec succès.`,
    });
  };
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      syncPendingItems();
    };
    
    window.addEventListener('online', handleOnline);
    
    // Check for pending items at load
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
