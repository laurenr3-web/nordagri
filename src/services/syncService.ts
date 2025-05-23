
import { IndexedDBService } from './offline/indexedDBService';

export interface SyncStatus {
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  isOnline: boolean;
}

export interface SyncQueueEntry {
  id?: number;
  type: 'add' | 'update' | 'delete';
  data: Record<string, any>;
  entity: string;
  createdAt: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
  processedAt?: number;
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
  public async update<T extends Record<string, any>>(storeName: string, id: string | number, data: T): Promise<void> {
    await IndexedDBService.updateInStore(storeName, {
      ...data,
      id,
      _updatedAt: Date.now(),
      _isOffline: true
    });
    await this.addToSyncQueue('update', { id, ...data }, storeName);
  }

  /**
   * Create an entity for offline first
   */
  public async create<T extends Record<string, any>>(storeName: string, data: T): Promise<any> {
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
    data: Record<string, any>,
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
  public async addToSyncQueue(type: 'add' | 'update' | 'delete', data: Record<string, any>, entity: string): Promise<number> {
    const queueEntry: SyncQueueEntry = {
      type,
      data,
      entity,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    const id = await IndexedDBService.addToStore('syncQueue', queueEntry) as number;
    await this.updatePendingCount();
    return id;
  }

  /**
   * Get all pending operations from the sync queue
   */
  public async getPendingOperations(): Promise<SyncQueueEntry[]> {
    try {
      const operations = await IndexedDBService.getAllFromStore<SyncQueueEntry>('syncQueue') || [];
      return operations;
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
          if (typeof operation.id !== 'number') {
            throw new Error('Operation missing ID field');
          }
          
          // Implement real sync logic instead of mock
          const { supabase } = await import('@/integrations/supabase/client');
          
          switch (operation.type) {
            case 'add':
              await supabase.from(operation.entity).insert(operation.data);
              break;
            case 'update':
              await supabase.from(operation.entity).update(operation.data).eq('id', operation.data.id);
              break;
            case 'delete':
              await supabase.from(operation.entity).delete().eq('id', operation.data.id);
              break;
          }
          
          // Mark as processed
          await IndexedDBService.updateInStore('syncQueue', {
            id: operation.id,
            status: 'success',
            processedAt: Date.now()
          });
          
          results.push({ id: operation.id, success: true });
        } catch (error) {
          if (typeof operation.id !== 'number') {
            console.error('Cannot update operation without ID', operation);
            continue;
          }
          
          const retryCount = operation.retryCount || 0;
          
          // Mark as failed
          await IndexedDBService.updateInStore('syncQueue', {
            id: operation.id,
            status: 'failed',
            error: String(error),
            retryCount: retryCount + 1
          });
          
          results.push({ id: operation.id, success: false, error });
        }
      }

      // Clean up successful operations
      if (results.every(r => r.success)) {
        const successfulOps = operations.filter(op => op.status === 'success');
        for (const op of successfulOps) {
          if (op.id) {
            await IndexedDBService.deleteFromStore('syncQueue', op.id);
          }
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
    try {
      const cached = await IndexedDBService.getByKey(tableName, key);
      return cached && typeof cached === 'object' && 'data' in cached ? (cached as any).data as T : null;
    } catch (error) {
      console.error(`Error fetching cached query result for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get sync statistics
   */
  public async getSyncStats(): Promise<{ pending: number; failed: number; success: number; }> {
    try {
      const operations = await this.getPendingOperations();
      
      const pending = operations.filter(op => op.status === 'pending').length;
      const failed = operations.filter(op => op.status === 'failed').length;
      const success = operations.filter(op => op.status === 'success').length;
  
      return { pending, failed, success };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      return { pending: 0, failed: 0, success: 0 };
    }
  }
}

// Export a singleton instance
export const syncService = new SyncService();
