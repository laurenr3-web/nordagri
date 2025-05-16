
import { useState } from 'react';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { SyncOperationType } from '@/services/offline/offlineSyncService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * Hook to facilitate the use of the offline synchronization system
 * @param entityType Type of entity being synchronized
 * @returns Functions and state to manage operations with offline support
 */
export function useOfflineSync<T extends Record<string, any>>(entityType: string) {
  const [queuedItems, setQueuedItems] = useState<Record<string, boolean>>({});
  const { isOnline, addToSyncQueue } = useOfflineStatus();
  const { t } = useTranslation();
  
  /**
   * Adds an operation to the synchronization queue
   * @param operationType Type of operation
   * @param data Data to synchronize
   * @param optimisticId Optimistic ID to identify the pending item
   */
  const queueOperation = async <D extends Record<string, any>>(
    operationType: SyncOperationType,
    data: D,
    optimisticId?: string | number
  ): Promise<string> => {
    try {
      // Determine the operation type from the operationType string
      const operation = operationType.startsWith('add_') ? 'insert' : 
                        operationType.startsWith('update_') ? 'update' : 
                        operationType.startsWith('delete_') ? 'delete' : 'insert';
      
      // Extract the table name from the operationType or use entityType
      const tableName = entityType;
      
      // Add to the synchronization queue
      const id = await addToSyncQueue(tableName, operation as 'insert' | 'update' | 'delete', data);
      
      // If an optimistic ID is provided, mark it as pending
      if (optimisticId) {
        setQueuedItems(prev => ({ ...prev, [optimisticId.toString()]: true }));
      }
      
      // Display a notification
      if (!isOnline) {
        toast.info(t("sync.operationQueued", { entityType }), {
          description: t("sync.willSyncWhenOnline")
        });
      }
      
      return id;
    } catch (error) {
      console.error('Error queueing operation:', error);
      toast.error(t("sync.errorQueueing", { entityType }));
      return '';
    }
  };
  
  /**
   * Checks if an item is pending synchronization
   * @param id ID of the item to check
   */
  const isItemQueued = (id: string | number): boolean => {
    return !!queuedItems[id.toString()];
  };
  
  /**
   * Marks an item as synchronized
   * @param id ID of the item to mark
   */
  const markItemSynced = (id: string | number): void => {
    setQueuedItems(prev => {
      const newItems = { ...prev };
      delete newItems[id.toString()];
      return newItems;
    });
  };
  
  /**
   * Creates an entity with offline support
   * @param entity Entity to create
   * @param onlineCreateFn Function to use when online
   */
  const createWithOfflineSupport = async <E extends Record<string, any>>(
    entity: E,
    onlineCreateFn: (data: E) => Promise<E & { id: string | number }>
  ): Promise<E & { id: string | number; _isOptimistic?: boolean }> => {
    try {
      if (isOnline) {
        // If online, use the normal function
        return await onlineCreateFn(entity);
      } else {
        // If offline, create a temporary ID and add to the queue
        const temporaryId = `temp_${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const entityWithId = { ...entity, id: temporaryId, _isOptimistic: true };
        
        await queueOperation(
          `add_${entityType}` as SyncOperationType,
          entity,
          temporaryId
        );
        
        return entityWithId;
      }
    } catch (error) {
      console.error(`Error creating ${entityType}:`, error);
      throw error;
    }
  };
  
  /**
   * Updates an entity with offline support
   * @param entity Entity to update
   * @param onlineUpdateFn Function to use when online
   */
  const updateWithOfflineSupport = async <E extends Record<string, any> & { id: string | number }>(
    entity: E,
    onlineUpdateFn: (data: E) => Promise<E>
  ): Promise<E> => {
    try {
      if (isOnline) {
        // If online, use the normal function
        return await onlineUpdateFn(entity);
      } else {
        // If offline, add to the queue
        await queueOperation(
          `update_${entityType}` as SyncOperationType,
          entity,
          entity.id
        );
        
        return entity;
      }
    } catch (error) {
      console.error(`Error updating ${entityType}:`, error);
      throw error;
    }
  };
  
  /**
   * Deletes an entity with offline support
   * @param id ID of the entity to delete
   * @param onlineDeleteFn Function to use when online
   */
  const deleteWithOfflineSupport = async (
    id: string | number,
    onlineDeleteFn: (id: string | number) => Promise<void>
  ): Promise<void> => {
    try {
      if (isOnline) {
        // If online, use the normal function
        await onlineDeleteFn(id);
      } else {
        // If offline, add to the queue
        await queueOperation(
          `delete_${entityType}` as SyncOperationType,
          { id },
          id
        );
      }
    } catch (error) {
      console.error(`Error deleting ${entityType}:`, error);
      throw error;
    }
  };
  
  return {
    queueOperation,
    isItemQueued,
    markItemSynced,
    createWithOfflineSupport,
    updateWithOfflineSupport,
    deleteWithOfflineSupport,
    isOnline
  };
}
