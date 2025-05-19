
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
    await IndexedDBService.deleteFromStore(storeName, id);
    await this.addToSyncQueue('delete', { id }, storeName);
  }
  
  /**
   * Add an operation to the sync queue for compatibility with existing code
   */
  public async addOperation(operation: { 
    type: string,
    entity: string,
    data: any,
    priority?: number
  }): Promise<number> {
    return this.addToSyncQueue(
      operation.type as 'add' | 'update' | 'delete',
      operation.data,
      operation.entity
    );
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
    try {
      return await IndexedDBService.getAllFromStore('sync_queue') || [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
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
          // Ensure the operation has an id property 
          const opId = 'id' in operation ? operation.id : null;
          if (opId === null) {
            throw new Error('Operation missing ID field');
          }
          
          // Mock processing for now - would be replaced with actual API calls
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Mark as processed
          await IndexedDBService.updateById('sync_queue', opId, {
            ...operation,
            status: 'success',
            processedAt: Date.now()
          });
          
          results.push({ id: opId as number, success: true });
        } catch (error) {
          // Ensure the operation has the required properties
          const opId = 'id' in operation ? operation.id : null;
          const retryCount = 'retryCount' in operation ? (operation.retryCount as number) : 0;
          
          if (opId === null) {
            console.error('Cannot update operation without ID', operation);
            continue;
          }
          
          // Mark as failed
          await IndexedDBService.updateById('sync_queue', opId, {
            ...operation,
            status: 'failed',
            error: String(error),
            retryCount: retryCount + 1
          });
          
          results.push({ id: opId as number, success: false, error });
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
    try {
      const pending = (await this.getPendingOperations()).filter(op => 
        op && typeof op === 'object' && 'status' in op && op.status === 'pending'
      ).length;
  
      const failed = (await this.getPendingOperations()).filter(op => 
        op && typeof op === 'object' && 'status' in op && op.status === 'failed'
      ).length;
  
      const success = (await this.getPendingOperations()).filter(op => 
        op && typeof op === 'object' && 'status' in op && op.status === 'success'
      ).length;
  
      return { pending, failed, success };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return { pending: 0, failed: 0, success: 0 };
    }
  }
}

// Export a singleton instance
export const syncService = new SyncService();
