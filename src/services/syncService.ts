
import { IndexedDBService } from './offline/indexedDBService';

export interface SyncOperation {
  id?: number;
  type: 'add' | 'update' | 'delete';
  entity: string; // e.g., 'interventions', 'equipment'
  data: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts?: number;
  errorMessage?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
}

// Create a type for event listeners
type SyncEventListener = (status: SyncStatus) => void;

class SyncServiceClass {
  private listeners: SyncEventListener[] = [];
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingSyncCount: 0,
    lastSyncTime: null
  };

  constructor() {
    // Initialize listeners for online/offline events
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
    
    // Initialize pending count
    this.updatePendingCount();
  }

  private async updatePendingCount(): Promise<void> {
    try {
      const stats = await this.getSyncStats();
      this.status.pendingSyncCount = stats.pending + stats.failed;
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }

  private updateOnlineStatus(isOnline: boolean): void {
    this.status.isOnline = isOnline;
    this.notifyListeners();

    // When coming back online, try to sync pending operations
    if (isOnline && this.status.pendingSyncCount > 0 && !this.status.isSyncing) {
      this.sync();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.status }));
  }

  // Get current sync status
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Register event listener
  public addEventListener(listener: SyncEventListener): void {
    this.listeners.push(listener);
  }

  // Remove event listener
  public removeEventListener(listenerToRemove: SyncEventListener): void {
    this.listeners = this.listeners.filter(listener => listener !== listenerToRemove);
  }

  /**
   * Add operation to sync queue
   */
  public async addToSyncQueue(type: 'add' | 'update' | 'delete', data: any, entity: string): Promise<number> {
    const operation: SyncOperation = {
      type,
      entity,
      data,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0
    };
    
    const id = await IndexedDBService.addToStore('syncQueue', operation) as number;
    await this.updatePendingCount();
    return id;
  }
  
  /**
   * Get all pending operations
   */
  public async getPendingOperations(): Promise<SyncOperation[]> {
    const allOperations = await IndexedDBService.getAllFromStore<SyncOperation>('syncQueue');
    return allOperations.filter(op => op.status === 'pending' || op.status === 'failed');
  }
  
  /**
   * Update operation status
   */
  public async updateOperationStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'failed', errorMessage?: string): Promise<void> {
    const operation = await IndexedDBService.getFromStore<SyncOperation>('syncQueue', id);
    if (operation) {
      operation.status = status;
      if (errorMessage) {
        operation.errorMessage = errorMessage;
      }
      if (status === 'failed') {
        operation.attempts = (operation.attempts || 0) + 1;
      }
      await IndexedDBService.updateInStore('syncQueue', operation);
      await this.updatePendingCount();
    }
  }
  
  /**
   * Remove completed operations
   */
  public async clearCompletedOperations(): Promise<void> {
    const allOperations = await IndexedDBService.getAllFromStore<SyncOperation>('syncQueue');
    const completed = allOperations.filter(op => op.status === 'completed');
    
    for (const op of completed) {
      if (op.id) {
        await IndexedDBService.deleteFromStore('syncQueue', op.id);
      }
    }
    
    await this.updatePendingCount();
  }
  
  /**
   * Get sync queue stats
   */
  public async getSyncStats(): Promise<{pending: number, failed: number, processing: number}> {
    const allOperations = await IndexedDBService.getAllFromStore<SyncOperation>('syncQueue');
    return {
      pending: allOperations.filter(op => op.status === 'pending').length,
      failed: allOperations.filter(op => op.status === 'failed').length,
      processing: allOperations.filter(op => op.status === 'processing').length
    };
  }

  /**
   * Cache query results for offline use
   */
  public async cacheQueryResult<T>(key: string, data: T, storeName: string): Promise<void> {
    await IndexedDBService.updateInStore('offline_cache', {
      key,
      data,
      timestamp: Date.now(),
      storeName
    });
  }

  /**
   * Get cached query results
   */
  public async getCachedQueryResult<T>(key: string): Promise<T | null> {
    try {
      const cache = await IndexedDBService.getByKey<{key: string, data: T}>('offline_cache', key);
      if (cache && 'data' in cache) {
        return cache.data as T;
      }
    } catch (error) {
      console.error('Error getting cached data:', error);
    }
    return null;
  }

  /**
   * Add an operation to the queue
   */
  public async addOperation(params: {
    type: 'add' | 'update' | 'delete';
    entity: string;
    data: any;
    priority: number;
  }): Promise<number> {
    const { type, entity, data, priority } = params;
    return this.addToSyncQueue(type, data, entity);
  }

  /**
   * Create a new entity for offline first
   */
  public async create<T>(storeName: string, data: T): Promise<number> {
    const id = await IndexedDBService.addToStore(storeName, {
      ...data,
      _createdAt: Date.now(),
      _isOffline: true
    });
    await this.addToSyncQueue('add', data, storeName);
    return id as number;
  }

  /**
   * Update an entity for offline first
   */
  public async update<T>(storeName: string, id: string | number, data: T): Promise<void> {
    await IndexedDBService.updateInStore(storeName, id, {
      ...data,
      _updatedAt: Date.now(),
      _isOffline: true
    });
    await this.addToSyncQueue('update', { id, ...data }, storeName);
  }

  /**
   * Delete an entity for offline first
   */
  public async delete(storeName: string, id: string | number): Promise<void> {
    await IndexedDBService.deleteFromStore(storeName, id);
    await this.addToSyncQueue('delete', { id }, storeName);
  }

  /**
   * Sync all pending operations
   */
  public async sync(): Promise<Array<{success: boolean, operation: SyncOperation}>> {
    if (this.status.isSyncing || !this.status.isOnline) {
      return [];
    }

    this.status.isSyncing = true;
    this.notifyListeners();

    try {
      const operations = await this.getPendingOperations();
      const results = [];

      for (const operation of operations) {
        try {
          if (operation.id) {
            await this.updateOperationStatus(operation.id, 'processing');
            
            // This is a placeholder for actual API calls
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Mark as completed
            await this.updateOperationStatus(operation.id, 'completed');
            results.push({ success: true, operation });
          }
        } catch (error) {
          console.error('Error processing operation:', error);
          if (operation.id) {
            await this.updateOperationStatus(
              operation.id, 
              'failed', 
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
          results.push({ success: false, operation });
        }
      }

      this.status.lastSyncTime = new Date();
      this.status.isSyncing = false;
      this.notifyListeners();

      await this.clearCompletedOperations();
      return results;
    } catch (error) {
      console.error('Error during sync:', error);
      this.status.isSyncing = false;
      this.notifyListeners();
      throw error;
    }
  }
}

// Singleton instance
export const syncService = new SyncServiceClass();
