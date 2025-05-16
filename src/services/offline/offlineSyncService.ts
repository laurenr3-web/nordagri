
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCallback, useState, useEffect } from 'react';
import { IndexedDBService } from './indexedDBService';
import { useNetworkState } from '@/hooks/useNetworkState';

// Types nécessaires à notre service de synchronisation
export interface SyncOperation {
  id: string;
  tableName: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'success' | 'error' | 'conflict';
  retryCount: number;
  error?: string;
  userId?: string;
}

export interface SyncStats {
  total: number;
  pending: number;
  success: number;
  error: number;
  conflict: number;
}

// Service de synchronisation hors ligne
export class OfflineSyncService {
  static async addToSyncQueue(
    tableName: string,
    operation: 'insert' | 'update' | 'delete',
    data: any,
    userId?: string
  ): Promise<string> {
    const syncOperation: SyncOperation = {
      id: uuidv4(),
      tableName,
      operation,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      userId
    };
    
    try {
      await IndexedDBService.addItem('sync_operations', syncOperation);
      console.log(`[OfflineSyncService] Added to sync queue: ${operation} on ${tableName}`, data);
      return syncOperation.id;
    } catch (error) {
      console.error('[OfflineSyncService] Error adding to sync queue:', error);
      throw error;
    }
  }
  
  static async getSyncOperations(status?: 'pending' | 'processing' | 'success' | 'error' | 'conflict'): Promise<SyncOperation[]> {
    try {
      const allOperations = await IndexedDBService.getAllItems('sync_operations');
      if (status) {
        return allOperations.filter(op => op.status === status);
      }
      return allOperations;
    } catch (error) {
      console.error('[OfflineSyncService] Error getting sync operations:', error);
      return [];
    }
  }
  
  static async updateSyncOperationStatus(
    id: string,
    status: 'pending' | 'processing' | 'success' | 'error' | 'conflict',
    error?: string
  ): Promise<void> {
    try {
      const operation = await IndexedDBService.getItem('sync_operations', id);
      if (operation) {
        operation.status = status;
        if (error) {
          operation.error = error;
        }
        await IndexedDBService.updateItem('sync_operations', operation);
      }
    } catch (error) {
      console.error('[OfflineSyncService] Error updating sync operation status:', error);
    }
  }
  
  static async clearSuccessfulOperations(olderThan?: number): Promise<void> {
    try {
      const allOperations = await IndexedDBService.getAllItems('sync_operations');
      const cutoff = olderThan || Date.now() - 7 * 24 * 60 * 60 * 1000; // Par défaut: 7 jours
      
      const operationsToDelete = allOperations
        .filter(op => op.status === 'success' && op.timestamp < cutoff)
        .map(op => op.id);
      
      for (const id of operationsToDelete) {
        await IndexedDBService.deleteItem('sync_operations', id);
      }
      
      console.log(`[OfflineSyncService] Cleared ${operationsToDelete.length} successful operations`);
    } catch (error) {
      console.error('[OfflineSyncService] Error clearing successful operations:', error);
    }
  }
  
  static async processSyncOperations(): Promise<SyncStats> {
    const pendingOperations = await this.getSyncOperations('pending');
    console.log(`[OfflineSyncService] Processing ${pendingOperations.length} pending operations`);
    
    let success = 0;
    let error = 0;
    let conflict = 0;
    
    for (const operation of pendingOperations) {
      try {
        await this.updateSyncOperationStatus(operation.id, 'processing');
        
        let result;
        switch (operation.operation) {
          case 'insert':
            result = await this.processInsert(operation);
            break;
          case 'update':
            result = await this.processUpdate(operation);
            break;
          case 'delete':
            result = await this.processDelete(operation);
            break;
        }
        
        if (result.error) {
          if (result.conflict) {
            await this.updateSyncOperationStatus(operation.id, 'conflict', result.error);
            conflict++;
          } else {
            await this.updateSyncOperationStatus(operation.id, 'error', result.error);
            error++;
          }
        } else {
          await this.updateSyncOperationStatus(operation.id, 'success');
          success++;
        }
      } catch (error: any) {
        console.error(`[OfflineSyncService] Error processing operation ${operation.id}:`, error);
        await this.updateSyncOperationStatus(operation.id, 'error', error.message || 'Unknown error');
        error++;
      }
    }
    
    // Récupérer toutes les statistiques
    const allOperations = await this.getSyncOperations();
    const stats: SyncStats = {
      total: allOperations.length,
      pending: allOperations.filter(op => op.status === 'pending').length,
      success: allOperations.filter(op => op.status === 'success').length,
      error: allOperations.filter(op => op.status === 'error').length,
      conflict: allOperations.filter(op => op.status === 'conflict').length
    };
    
    return stats;
  }
  
  private static async processInsert(operation: SyncOperation): Promise<{ error?: string; conflict?: boolean }> {
    try {
      const { data } = operation;
      
      // Vérifier si l'enregistrement existe déjà (pour éviter les doublons)
      if (data.id) {
        const { data: existingData, error: checkError } = await supabase
          .from(operation.tableName as any)
          .select('id')
          .eq('id', data.id)
          .single();
        
        if (existingData) {
          return { 
            error: `Record already exists with id ${data.id}`, 
            conflict: true 
          };
        }
      }
      
      const { error } = await supabase
        .from(operation.tableName as any)
        .insert(data);
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message || 'Error during insert operation' };
    }
  }
  
  private static async processUpdate(operation: SyncOperation): Promise<{ error?: string; conflict?: boolean }> {
    try {
      const { data } = operation;
      
      if (!data.id) {
        return { error: 'No ID provided for update operation' };
      }
      
      // Vérifier si l'enregistrement existe et s'il a été modifié depuis
      const { data: currentData, error: checkError } = await supabase
        .from(operation.tableName as any)
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (checkError || !currentData) {
        return { 
          error: checkError ? checkError.message : `Record with id ${data.id} not found`,
          conflict: !currentData
        };
      }
      
      // Si le timestamp de mise à jour est défini, vérifier les conflits
      if (data.updated_at && currentData.updated_at) {
        const localDate = new Date(data.updated_at);
        const remoteDate = new Date(currentData.updated_at);
        
        if (remoteDate > localDate) {
          return { 
            error: `Remote record has been modified more recently (${remoteDate.toISOString()} > ${localDate.toISOString()})`,
            conflict: true
          };
        }
      }
      
      const { error } = await supabase
        .from(operation.tableName as any)
        .update(data)
        .eq('id', data.id);
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message || 'Error during update operation' };
    }
  }
  
  private static async processDelete(operation: SyncOperation): Promise<{ error?: string; conflict?: boolean }> {
    try {
      const { data } = operation;
      
      if (!data.id) {
        return { error: 'No ID provided for delete operation' };
      }
      
      // Vérifier si l'enregistrement existe encore
      const { data: existingData, error: checkError } = await supabase
        .from(operation.tableName as any)
        .select('id')
        .eq('id', data.id)
        .single();
      
      if (checkError) {
        // Si l'erreur est que l'enregistrement n'existe pas, ce n'est pas un problème
        if (checkError.code === 'PGRST116') {
          return {}; // L'enregistrement est déjà supprimé, c'est ok
        }
        return { error: checkError.message };
      }
      
      const { error } = await supabase
        .from(operation.tableName as any)
        .delete()
        .eq('id', data.id);
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message || 'Error during delete operation' };
    }
  }
}

// Hook pour utiliser le service de synchronisation dans les composants React
export function useOfflineSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    total: 0,
    pending: 0,
    success: 0,
    error: 0,
    conflict: 0
  });
  
  const isOnline = useNetworkState();
  
  // Charger les opérations en attente au démarrage
  const loadPendingOperations = useCallback(async () => {
    try {
      const pendingOps = await OfflineSyncService.getSyncOperations('pending');
      setSyncCount(pendingOps.length);
      
      const allOps = await OfflineSyncService.getSyncOperations();
      setSyncStats({
        total: allOps.length,
        pending: allOps.filter(op => op.status === 'pending').length,
        success: allOps.filter(op => op.status === 'success').length,
        error: allOps.filter(op => op.status === 'error').length,
        conflict: allOps.filter(op => op.status === 'conflict').length
      });
    } catch (error) {
      console.error('[useOfflineSyncManager] Error loading pending operations:', error);
    }
  }, []);
  
  // Synchroniser les opérations en attente
  const syncPendingItems = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      const stats = await OfflineSyncService.processSyncOperations();
      setSyncStats(stats);
      setSyncCount(stats.pending);
      
      if (stats.success > 0) {
        toast.success(`${stats.success} élément(s) synchronisé(s) avec succès`);
      }
      
      if (stats.error > 0) {
        toast.error(`${stats.error} erreur(s) de synchronisation`);
      }
      
      if (stats.conflict > 0) {
        toast.warning(`${stats.conflict} conflit(s) de synchronisation détecté(s)`);
      }
      
      // Nettoyer les opérations réussies après 7 jours
      await OfflineSyncService.clearSuccessfulOperations();
    } catch (error) {
      console.error('[useOfflineSyncManager] Error syncing pending items:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);
  
  // Synchroniser automatiquement lorsque la connexion est rétablie
  useEffect(() => {
    if (isOnline) {
      syncPendingItems();
    }
  }, [isOnline, syncPendingItems]);
  
  // Charger les opérations en attente au démarrage et configurer un intervalle de vérification
  useEffect(() => {
    loadPendingOperations();
    
    const interval = setInterval(() => {
      loadPendingOperations();
    }, 30000); // Vérifier toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [loadPendingOperations]);
  
  return {
    isSyncing,
    syncCount,
    syncStats,
    syncPendingItems,
    addToSyncQueue: OfflineSyncService.addToSyncQueue
  };
}
