
import { IndexedDBService } from './offline/indexedDBService';

export interface SyncStatus {
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  isOnline: boolean;
}

export class SyncService {
  private listeners: ((status: SyncStatus) => void)[] = [];
  private status: SyncStatus = {
    pendingSyncCount: 0,
    lastSyncTime: null,
    isSyncing: false,
    isOnline: true
  };

  /**
   * Update an entity for offline first
   */
  public async update<T>(storeName: string, id: string | number, data: T): Promise<void> {
    await IndexedDBService.updateById(storeName, id, {
      ...data,
      _updatedAt: Date.now(),
      _isOffline: true
    });
    await this.addToSyncQueue('update', { id, ...data }, storeName);
  }

  /**
   * Create an entity for offline first
   */
  public async create<T>(storeName: string, data: T): Promise<any> {
    const record = {
      ...data,
      _createdAt: Date.now(),
      _updatedAt: Date.now(),
      _isOffline: true
    };
    const id = await IndexedDBService.addToStore(storeName, record);
    await this.addToSyncQueue('add', { ...record, id }, storeName);
    return id;
  }

  /**
   * Delete an entity for offline first
   */
  public async delete(storeName: string, id: string | number): Promise<void> {
    await IndexedDBService.deleteById(storeName, id);
    await this.addToSyncQueue('delete', { id }, storeName);
  }

  /**
   * Add an operation to the sync queue
   */
  public async addToSyncQueue(type: 'add' | 'update' | 'delete', data: any, entity: string): Promise<number> {
    const queueEntry = {
      type,
      data,
      entity,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'pending' as 'pending' | 'processing' | 'success' | 'failed'
    };

    const id = await IndexedDBService.addToStore('sync_queue', queueEntry);
    await this.updatePendingCount();
    return id;
  }

  /**
   * Get all pending operations from the sync queue
   */
  public async getPendingOperations() {
    return await IndexedDBService.getAllFromStore('sync_queue', query => 
      query.where('status').equals('pending')
    ) || [];
  }

  /**
   * Update the pending operations count
   */
  private async updatePendingCount(): Promise<void> {
    const count = await this.getPendingOperationsCount();
    this.status = {
      ...this.status,
      pendingSyncCount: count
    };
    this.notifyListeners();
  }

  /**
   * Get the count of pending operations
   */
  private async getPendingOperationsCount(): Promise<number> {
    const operations = await this.getPendingOperations();
    return operations.length;
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.status);
    });
  }

  /**
   * Add a status change listener
   */
  public addEventListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a status change listener
   */
  public removeEventListener(listener: (status: SyncStatus) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Get the current sync status
   */
  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Synchronize all pending operations
   */
  public async sync(): Promise<Array<{ id: number; success: boolean; error?: any }>> {
    if (this.status.isSyncing || !this.status.isOnline) {
      return [];
    }

    this.status = {
      ...this.status,
      isSyncing: true
    };
    this.notifyListeners();

    try {
      const operations = await this.getPendingOperations();
      const results: Array<{ id: number; success: boolean; error?: any }> = [];

      // Process operations in sequence
      for (const operation of operations) {
        try {
          // Mock processing for now - would be replaced with actual API calls
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Mark as processed
          await IndexedDBService.updateById('sync_queue', operation.id, {
            ...operation,
            status: 'success',
            processedAt: Date.now()
          });
          
          results.push({ id: operation.id, success: true });
        } catch (error) {
          // Mark as failed
          await IndexedDBService.updateById('sync_queue', operation.id, {
            ...operation,
            status: 'failed',
            error: String(error),
            retryCount: operation.retryCount + 1
          });
          
          results.push({ id: operation.id, success: false, error });
        }
      }

      this.status = {
        ...this.status,
        lastSyncTime: new Date(),
        isSyncing: false
      };
      
      await this.updatePendingCount();
      return results;
    } catch (error) {
      this.status = {
        ...this.status,
        isSyncing: false
      };
      
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Cache a query result for offline access
   */
  public async cacheQueryResult<T>(key: string, data: T, tableName: string = 'offline_cache'): Promise<void> {
    await IndexedDBService.updateInStore(tableName, {
      key,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get a cached query result
   */
  public async getCachedQueryResult<T>(key: string, tableName: string = 'offline_cache'): Promise<T | null> {
    const cached = await IndexedDBService.getByKey(tableName, key);
    return cached && typeof cached === 'object' && 'data' in cached ? cached.data as T : null;
  }

  /**
   * Get sync statistics
   */
  public async getSyncStats(): Promise<{ pending: number; failed: number; success: number; }> {
    const pending = (await IndexedDBService.getAllFromStore('sync_queue', query => 
      query.where('status').equals('pending')
    )).length;

    const failed = (await IndexedDBService.getAllFromStore('sync_queue', query => 
      query.where('status').equals('failed')
    )).length;

    const success = (await IndexedDBService.getAllFromStore('sync_queue', query => 
      query.where('status').equals('success')
    )).length;

    return { pending, failed, success };
  }
}

// Export a singleton instance
export const syncService = new SyncService();
