
import { SyncOperationType } from '@/providers/OfflineProvider';
import { IndexedDBService } from './offline/indexedDBService';

// Define the sync operation interface
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entity: string;
  data: any;
  timestamp: number;
  priority: number;
  dependencies?: string[];
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  errors: Error[];
}

// Create the sync service class
export class SyncService {
  private dbService: IndexedDBService;
  private isProcessing: boolean = false;
  private eventListeners: Record<string, Function[]> = {};
  private supabaseClient: any = null;

  constructor(dbService: IndexedDBService) {
    this.dbService = dbService;
  }

  // Set Supabase client
  setSupabaseClient(client: any) {
    this.supabaseClient = client;
  }

  // Event listener management
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private triggerEvent(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Get the number of pending operations
  async getPendingOperationsCount(): Promise<number> {
    try {
      const operations = await this.dbService.getAllFromStore('syncOperations');
      return operations.length;
    } catch (error) {
      console.error('Error getting pending operations count:', error);
      return 0;
    }
  }

  // Get the current sync status
  getStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.isProcessing,
      pendingSyncCount: 0, // This will be replaced with actual count when needed
      lastSyncTime: null,
      errors: []
    };
  }

  // Add a new operation to the sync queue
  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const fullOperation: SyncOperation = {
      ...operation,
      id,
      timestamp,
    };
    
    await this.dbService.addToStore('syncOperations', fullOperation);
    
    // Update status and notify listeners
    const status = await this.getUpdatedStatus();
    this.triggerEvent('statusChange', status);
    
    return id;
  }

  // Cache query results for offline use
  async cacheQueryResult<T>(key: string, data: T, tableName: string): Promise<void> {
    try {
      await this.dbService.updateInStore('offline_cache', {
        key,
        data,
        tableName,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error caching query result:', error);
    }
  }

  // Get cached query results
  async getCachedQueryResult<T>(key: string): Promise<T | null> {
    try {
      const cacheItem = await this.dbService.getByKey('offline_cache', key);
      if (cacheItem && typeof cacheItem === 'object' && 'data' in cacheItem) {
        return cacheItem.data as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached query result:', error);
      return null;
    }
  }

  // Process all pending operations
  async sync(): Promise<Array<{ id: string, success: boolean, error?: Error }>> {
    if (this.isProcessing) {
      return [];
    }
    
    this.isProcessing = true;
    this.triggerEvent('statusChange', await this.getUpdatedStatus());
    
    try {
      // Get all operations sorted by priority (higher first) and timestamp
      const operations = await this.dbService.getAllFromStore('syncOperations');
      const sortedOperations = operations.sort((a: SyncOperation, b: SyncOperation) => {
        if (a.priority === b.priority) {
          return a.timestamp - b.timestamp; // Older first
        }
        return b.priority - a.priority; // Higher priority first
      });
      
      const results = [];
      
      // Process operations sequentially
      for (const operation of sortedOperations) {
        try {
          // Check if all dependencies are met
          if (operation.dependencies?.length) {
            const pendingDeps = operations.filter(op => 
              operation.dependencies?.includes(op.id)
            );
            
            if (pendingDeps.length > 0) {
              // Skip this operation for now
              results.push({ id: operation.id, success: false, error: new Error('Dependencies not met') });
              continue;
            }
          }
          
          // Process the operation based on type
          await this.processOperation(operation);
          
          // Remove from queue after successful processing
          await this.dbService.deleteFromStore('syncOperations', operation.id);
          results.push({ id: operation.id, success: true });
        } catch (error) {
          console.error(`Error processing operation ${operation.id}:`, error);
          results.push({ 
            id: operation.id, 
            success: false, 
            error: error instanceof Error ? error : new Error('Unknown error') 
          });
        }
      }

      return results;
    } finally {
      this.isProcessing = false;
      this.triggerEvent('statusChange', await this.getUpdatedStatus());
    }
  }

  // Get updated status with current pending count
  private async getUpdatedStatus(): Promise<SyncStatus> {
    const pendingSyncCount = await this.getPendingOperationsCount();
    const currentStatus = this.getStatus();
    return {
      ...currentStatus,
      pendingSyncCount
    };
  }

  // CRUD operations for offline sync
  async create(tableName: string, data: any): Promise<string> {
    const id = crypto.randomUUID();
    await this.addOperation({
      type: SyncOperationType.CREATE,
      entity: tableName,
      data: { ...data, id },
      priority: 5
    });
    return id;
  }

  async update(tableName: string, id: string | number, data: any): Promise<void> {
    await this.addOperation({
      type: SyncOperationType.UPDATE,
      entity: tableName,
      data: { id, ...data },
      priority: 4
    });
  }

  async delete(tableName: string, id: string | number): Promise<void> {
    await this.addOperation({
      type: SyncOperationType.DELETE,
      entity: tableName,
      data: { id },
      priority: 3
    });
  }

  // Process a single operation
  private async processOperation(operation: SyncOperation): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not set');
    }
    
    switch (operation.type) {
      case SyncOperationType.CREATE:
        // Implementation for create operation using Supabase
        if (operation.data.id) {
          await this.supabaseClient.from(operation.entity).insert(operation.data);
        }
        break;
      case SyncOperationType.UPDATE:
        // Implementation for update operation using Supabase
        if (operation.data.id) {
          const { id, ...updateData } = operation.data;
          await this.supabaseClient.from(operation.entity).update(updateData).eq('id', id);
        }
        break;
      case SyncOperationType.DELETE:
        // Implementation for delete operation using Supabase
        if (operation.data.id) {
          await this.supabaseClient.from(operation.entity).delete().eq('id', operation.data.id);
        }
        break;
      case SyncOperationType.BATCH:
        // Implementation for batch operation
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
}

// Create singleton instance
const dbService = new IndexedDBService();
export const syncService = new SyncService(dbService);

// Helper hook to use the sync service
export const useSyncService = () => {
  // Return the singleton instance
  return syncService;
};
