
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

export const syncService = {
  /**
   * Add operation to sync queue
   * @param type Operation type
   * @param data Operation data
   * @param entity Entity type
   * @returns Promise<number> Operation ID
   */
  async addToSyncQueue(type: 'add' | 'update' | 'delete', data: any, entity: string): Promise<number> {
    const operation: SyncOperation = {
      type,
      entity,
      data,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0
    };
    
    return await IndexedDBService.addToStore('syncQueue', operation) as number;
  },
  
  /**
   * Get all pending operations
   * @returns Promise<SyncOperation[]>
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    const allOperations = await IndexedDBService.getAllFromStore<SyncOperation>('syncQueue');
    return allOperations.filter(op => op.status === 'pending' || op.status === 'failed');
  },
  
  /**
   * Update operation status
   * @param id Operation ID
   * @param status New status
   * @param errorMessage Optional error message
   */
  async updateOperationStatus(id: number, status: 'pending' | 'processing' | 'completed' | 'failed', errorMessage?: string): Promise<void> {
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
    }
  },
  
  /**
   * Remove completed operations
   */
  async clearCompletedOperations(): Promise<void> {
    const allOperations = await IndexedDBService.getAllFromStore<SyncOperation>('syncQueue');
    const completed = allOperations.filter(op => op.status === 'completed');
    
    for (const op of completed) {
      if (op.id) {
        await IndexedDBService.deleteFromStore('syncQueue', op.id);
      }
    }
  },
  
  /**
   * Get sync queue stats
   */
  async getSyncStats(): Promise<{pending: number, failed: number, processing: number}> {
    const allOperations = await IndexedDBService.getAllFromStore<SyncOperation>('syncQueue');
    return {
      pending: allOperations.filter(op => op.status === 'pending').length,
      failed: allOperations.filter(op => op.status === 'failed').length,
      processing: allOperations.filter(op => op.status === 'processing').length
    };
  }
};
