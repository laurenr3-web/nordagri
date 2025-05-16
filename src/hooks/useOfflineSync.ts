
import { useState } from 'react';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { SyncOperationType } from '@/services/offline/offlineSyncService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/**
 * Hook pour faciliter l'utilisation du système de synchronisation hors-ligne
 * @param entityType Type d'entité pour laquelle on gère la synchronisation
 * @returns Fonctions et état pour gérer les opérations avec support hors-ligne
 */
export function useOfflineSync<T extends Record<string, any>>(entityType: string) {
  const [queuedItems, setQueuedItems] = useState<Record<string, boolean>>({});
  const { isOnline, addToSyncQueue } = useOfflineStatus();
  const { t } = useTranslation();
  
  /**
   * Ajoute une opération à la file de synchronisation
   * @param operationType Type d'opération
   * @param data Données à synchroniser
   * @param optimisticId ID optimiste pour identifier l'élément en attente
   */
  const queueOperation = async <D extends Record<string, any>>(
    operationType: SyncOperationType,
    data: D,
    optimisticId?: string | number
  ): Promise<string> => {
    try {
      // Ajouter à la file de synchronisation
      const id = await addToSyncQueue(operationType, data);
      
      // Si un ID optimiste est fourni, le marquer comme en attente
      if (optimisticId) {
        setQueuedItems(prev => ({ ...prev, [optimisticId.toString()]: true }));
      }
      
      // Afficher une notification
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
   * Vérifie si un élément est en attente de synchronisation
   * @param id ID de l'élément à vérifier
   */
  const isItemQueued = (id: string | number): boolean => {
    return !!queuedItems[id.toString()];
  };
  
  /**
   * Marque un élément comme synchronisé
   * @param id ID de l'élément à marquer
   */
  const markItemSynced = (id: string | number): void => {
    setQueuedItems(prev => {
      const newItems = { ...prev };
      delete newItems[id.toString()];
      return newItems;
    });
  };
  
  /**
   * Crée une entité avec support hors-ligne
   * @param entity Entité à créer
   * @param onlineCreateFn Fonction à utiliser quand en ligne
   */
  const createWithOfflineSupport = async <E extends Record<string, any>>(
    entity: E,
    onlineCreateFn: (data: E) => Promise<E & { id: string | number }>
  ): Promise<E & { id: string | number; _isOptimistic?: boolean }> => {
    try {
      if (isOnline) {
        // Si en ligne, utiliser la fonction normale
        return await onlineCreateFn(entity);
      } else {
        // Si hors ligne, créer un ID temporaire et ajouter à la file
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
   * Met à jour une entité avec support hors-ligne
   * @param entity Entité à mettre à jour
   * @param onlineUpdateFn Fonction à utiliser quand en ligne
   */
  const updateWithOfflineSupport = async <E extends Record<string, any> & { id: string | number }>(
    entity: E,
    onlineUpdateFn: (data: E) => Promise<E>
  ): Promise<E> => {
    try {
      if (isOnline) {
        // Si en ligne, utiliser la fonction normale
        return await onlineUpdateFn(entity);
      } else {
        // Si hors ligne, ajouter à la file
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
   * Supprime une entité avec support hors-ligne
   * @param id ID de l'entité à supprimer
   * @param onlineDeleteFn Fonction à utiliser quand en ligne
   */
  const deleteWithOfflineSupport = async (
    id: string | number,
    onlineDeleteFn: (id: string | number) => Promise<void>
  ): Promise<void> => {
    try {
      if (isOnline) {
        // Si en ligne, utiliser la fonction normale
        await onlineDeleteFn(id);
      } else {
        // Si hors ligne, ajouter à la file
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
