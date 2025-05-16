import { supabase } from '@/integrations/supabase/client';
import { IndexedDBService } from './indexedDBService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Types for sync queue items
export type SyncOperationType = 
  | 'add_intervention' 
  | 'update_intervention' 
  | 'delete_intervention' 
  | 'add_time_entry' 
  | 'update_time_entry' 
  | 'delete_time_entry';

export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  data: any;
  timestamp: number;
  retryCount?: number;
  lastError?: string;
  tableName: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  itemId?: string;
  affectedRecords?: number;
  error?: any;
}

const SYNC_QUEUE_STORE = 'sync_queue';
const MAX_RETRY_COUNT = 3;

// Utility function to format a local identifier
const formatLocalId = (type: string) => `local_${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

// Offline Sync Service
export class OfflineSyncService {
  /**
   * Add an item to the sync queue
   */
  static async addToSyncQueue(
    type: SyncOperationType, 
    data: any, 
    tableName: string
  ): Promise<string> {
    try {
      // Create new item
      const id = uuidv4();
      const newItem: SyncQueueItem = {
        id,
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
        tableName
      };
      
      // Add item to IndexedDB
      await IndexedDBService.addToStore(SYNC_QUEUE_STORE, newItem);
      
      return id;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }
  
  /**
   * Get the sync queue
   */
  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      return await IndexedDBService.getAllFromStore<SyncQueueItem>(SYNC_QUEUE_STORE);
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }
  
  /**
   * Get the count of pending sync items
   */
  static async getPendingSyncCount(): Promise<number> {
    try {
      const queue = await this.getSyncQueue();
      return queue.length;
    } catch (error) {
      console.error('Error getting pending sync count:', error);
      return 0;
    }
  }
  
  /**
   * Remove an item from the sync queue
   */
  static async removeFromSyncQueue(id: string): Promise<void> {
    try {
      await IndexedDBService.deleteFromStore(SYNC_QUEUE_STORE, id);
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  }
  
  /**
   * Clear the sync queue
   */
  static async clearSyncQueue(): Promise<void> {
    try {
      await IndexedDBService.clearStore(SYNC_QUEUE_STORE);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }
  
  /**
   * Process a sync queue item
   */
  static async processSyncItem(item: SyncQueueItem): Promise<SyncResult> {
    const { type, data, tableName, id } = item;
    
    try {
      if (!tableName) {
        throw new Error('Table name is required for sync operations');
      }
      
      let result: SyncResult;
      
      // Process based on operation type
      switch (type) {
        case 'add_intervention':
        case 'add_time_entry': {
          // Remove the local IDs that might have been added
          const { id: localId, ...dataToInsert } = data;
          
          // Insert data into the specified table
          const { data: insertedData, error } = await supabase
            .from(tableName as any)
            .insert(dataToInsert)
            .select();
            
          if (error) throw error;
          
          result = {
            success: true,
            message: `Successfully added to ${tableName}`,
            itemId: insertedData && insertedData[0]?.id,
            affectedRecords: 1
          };
          
          break;
        }
          
        case 'update_intervention':
        case 'update_time_entry': {
          // Handle update operations
          const { id: recordId, ...dataToUpdate } = data;
          
          // If the ID starts with 'local_', we need to create instead of update
          if (typeof recordId === 'string' && recordId.startsWith('local_')) {
            const { data: insertedData, error } = await supabase
              .from(tableName as any)
              .insert(dataToUpdate)
              .select();
              
            if (error) throw error;
            
            result = {
              success: true,
              message: `Successfully created item in ${tableName} (was local)`,
              itemId: insertedData && insertedData[0]?.id,
              affectedRecords: 1
            };
          } else {
            const { data: updatedData, error } = await supabase
              .from(tableName as any)
              .update(dataToUpdate)
              .eq('id', recordId)
              .select();
              
            if (error) throw error;
            
            result = {
              success: true,
              message: `Successfully updated item in ${tableName}`,
              itemId: recordId,
              affectedRecords: updatedData ? updatedData.length : 0
            };
          }
          
          break;
        }
          
        case 'delete_intervention':
        case 'delete_time_entry': {
          // Handle delete operations
          const recordId = typeof data === 'object' ? data.id : data;
          
          // If the ID starts with 'local_', no need to delete from the database
          if (typeof recordId === 'string' && recordId.startsWith('local_')) {
            result = {
              success: true,
              message: `Skipped deleting local item from ${tableName}`,
              itemId: recordId,
              affectedRecords: 0
            };
          } else {
            const { error } = await supabase
              .from(tableName as any)
              .delete()
              .eq('id', recordId);
              
            if (error) throw error;
            
            result = {
              success: true,
              message: `Successfully deleted item from ${tableName}`,
              itemId: recordId,
              affectedRecords: 1
            };
          }
          
          break;
        }
          
        default:
          throw new Error(`Unsupported operation type: ${type}`);
      }
      
      return result;
    } catch (error: any) {
      console.error(`Error processing sync item ${id}:`, error);
      
      // Update retry count and error information
      const updatedItem = {
        ...item,
        retryCount: (item.retryCount || 0) + 1,
        lastError: error.message || 'Unknown error'
      };
      
      await IndexedDBService.updateInStore(SYNC_QUEUE_STORE, updatedItem);
      
      return {
        success: false,
        message: `Failed to process ${type} operation: ${error.message}`,
        error
      };
    }
  }
  
  /**
   * Process the sync queue
   */
  static async processSyncQueue(
    onProgress?: (current: number, total: number) => void,
    onComplete?: (results: SyncResult[]) => void
  ): Promise<SyncResult[]> {
    try {
      // Get all sync queue items
      const queue = await this.getSyncQueue();
      
      if (queue.length === 0) {
        return [];
      }
      
      const results: SyncResult[] = [];
      let processed = 0;
      
      // Sort by timestamp to process in order
      const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);
      
      for (const item of sortedQueue) {
        // Skip items that have exceeded retry count
        if ((item.retryCount || 0) >= MAX_RETRY_COUNT) {
          results.push({
            success: false,
            message: `Max retry count reached for item ${item.id}`,
            itemId: item.id,
            error: new Error('Max retry count exceeded')
          });
          
          // We keep failed items in the queue for manual resolution
          processed++;
          onProgress?.(processed, queue.length);
          continue;
        }
        
        // Process the item
        const result = await this.processSyncItem(item);
        results.push(result);
        
        // Remove from queue if successful
        if (result.success) {
          await this.removeFromSyncQueue(item.id);
        }
        
        processed++;
        onProgress?.(processed, queue.length);
      }
      
      onComplete?.(results);
      return results;
    } catch (error) {
      console.error('Error processing sync queue:', error);
      return [{
        success: false,
        message: `Failed to process sync queue: ${error}`,
        error
      }];
    }
  }
  
  /**
   * Save an item to offline cache
   */
  static async saveToOfflineCache(key: string, data: any): Promise<void> {
    try {
      await IndexedDBService.updateInStore('offline_cache', {
        key,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error saving to offline cache:', error);
    }
  }
  
  /**
   * Get an item from offline cache
   */
  static async getFromOfflineCache<T>(key: string): Promise<T | null> {
    try {
      const cacheItem = await IndexedDBService.getByKey('offline_cache', key);
      return cacheItem ? cacheItem.data : null;
    } catch (error) {
      console.error('Error getting from offline cache:', error);
      return null;
    }
  }
  
  /**
   * Create a local ID for offline records
   */
  static createLocalId(type: SyncOperationType): string {
    return formatLocalId(type);
  }
  
  /**
   * Check if an ID is a local (offline-generated) ID
   */
  static isLocalId(id: string | number): boolean {
    return typeof id === 'string' && id.startsWith('local_');
  }
}

// Hook to manage sync when the user comes back online
export function useOfflineSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const { toast } = useToast();
  
  // Function to sync pending items
  const syncPendingItems = async () => {
    const queue = await OfflineSyncService.getSyncQueue();
    
    if (queue.length === 0) return;
    
    setIsSyncing(true);
    setSyncCount(queue.length);
    
    toast({
      title: "Synchronisation en cours",
      description: `${queue.length} élément(s) en attente de synchronisation...`,
    });
    
    try {
      await OfflineSyncService.processSyncQueue(
        (current, total) => {
          // Update progress
          setSyncCount(total - current);
        },
        (results) => {
          // Handle completion
          const successCount = results.filter(r => r.success).length;
          const failCount = results.filter(r => !r.success).length;
          
          if (failCount === 0) {
            toast({
              title: "Synchronisation terminée",
              description: `${successCount} élément(s) synchronisé(s) avec succès.`,
            });
          } else {
            toast({
              title: "Synchronisation terminée avec des erreurs",
              description: `${successCount} élément(s) synchronisé(s), ${failCount} échec(s).`,
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Erreur de synchronisation",
        description: `Une erreur est survenue: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      // Update final count
      const remainingQueue = await OfflineSyncService.getSyncQueue();
      setSyncCount(remainingQueue.length);
    }
  };
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      syncPendingItems();
    };
    
    window.addEventListener('online', handleOnline);
    
    // Check for pending items at load
    if (navigator.onLine) {
      const checkQueue = async () => {
        const queue = await OfflineSyncService.getSyncQueue();
        setSyncCount(queue.length);
        if (queue.length > 0) {
          syncPendingItems();
        }
      };
      
      checkQueue();
    }
    
    // Set up interval to periodically check sync count
    const interval = setInterval(async () => {
      const queue = await OfflineSyncService.getSyncQueue();
      setSyncCount(queue.length);
    }, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);
  
  return { isSyncing, syncCount };
}
