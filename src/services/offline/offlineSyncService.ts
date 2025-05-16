
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { indexedDBService, SyncQueueItemWithMeta } from './indexedDBService';
import { useNetworkState } from '@/hooks/useNetworkState';
import { supabase } from '@/integrations/supabase/client';

// Types pour les différentes opérations en attente de synchronisation
export type SyncOperationType = 
  'add_intervention' | 'update_intervention' | 'delete_intervention' | 
  'add_time_entry' | 'update_time_entry' | 'delete_time_entry' |
  'add_maintenance' | 'update_maintenance' | 'delete_maintenance' |
  'add_equipment' | 'update_equipment' | 'delete_equipment' |
  'add_part' | 'update_part' | 'delete_part';

// Interface pour un élément dans la file d'attente de synchronisation
export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  data: any;
  timestamp: number;
}

// Statut possible pour une opération de synchronisation
export type SyncStatus = 'pending' | 'syncing' | 'success' | 'error' | 'conflict';

// Interface pour les statistiques de synchronisation
export interface SyncStats {
  total: number;
  pending: number;
  success: number;
  error: number;
  conflict: number;
}

// Interface pour les résultats d'une opération de synchronisation
interface SyncResult {
  status: SyncStatus;
  itemId: string;
  error?: Error;
}

// Classe qui gère la synchronisation hors-ligne
export class OfflineSyncService {
  // Ajouter un élément à la file d'attente de synchronisation
  static async addToSyncQueue(type: SyncOperationType, data: any): Promise<string> {
    try {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Créer l'élément à synchroniser
      const newItem: Omit<SyncQueueItemWithMeta, 'meta'> = {
        id,
        type,
        data,
        timestamp: Date.now()
      };
      
      // Ajouter à IndexedDB
      return await indexedDBService.addToSyncQueue(newItem);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      // Fallback vers localStorage si IndexedDB échoue
      this.fallbackAddToLocalStorage(type, data);
      return '';
    }
  }
  
  // Fallback pour ajouter à localStorage si IndexedDB n'est pas disponible
  private static fallbackAddToLocalStorage(type: SyncOperationType, data: any): string {
    try {
      const SYNC_QUEUE_KEY = 'nordagri_sync_queue';
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Créer l'élément à synchroniser
      const newItem: SyncQueueItem = {
        id,
        type,
        data,
        timestamp: Date.now()
      };
      
      // Récupérer la file d'attente existante ou créer une nouvelle
      const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
      const queue = queueJson ? JSON.parse(queueJson) : [];
      
      // Ajouter l'élément et sauvegarder
      queue.push(newItem);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      console.warn('Fallback to localStorage for sync queue item', id);
      return id;
    } catch (error) {
      console.error('Error in localStorage fallback:', error);
      return '';
    }
  }
  
  // Récupérer tous les éléments dans la file d'attente
  static async getSyncQueue(): Promise<SyncQueueItemWithMeta[]> {
    try {
      return await indexedDBService.getSyncQueue();
    } catch (error) {
      console.error('Error getting sync queue from IndexedDB:', error);
      // Fallback vers localStorage
      return this.fallbackGetFromLocalStorage();
    }
  }
  
  // Fallback pour récupérer depuis localStorage
  private static fallbackGetFromLocalStorage(): SyncQueueItemWithMeta[] {
    try {
      const SYNC_QUEUE_KEY = 'nordagri_sync_queue';
      const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
      const items = queueJson ? JSON.parse(queueJson) : [];
      
      // Convertir au format avec métadonnées
      return items.map((item: SyncQueueItem) => ({
        ...item,
        meta: {
          attempts: 0
        }
      }));
    } catch (error) {
      console.error('Error in localStorage fallback get:', error);
      return [];
    }
  }
  
  // Supprimer un élément de la file d'attente
  static async removeFromSyncQueue(id: string): Promise<boolean> {
    try {
      return await indexedDBService.removeFromSyncQueue(id);
    } catch (error) {
      console.error('Error removing from sync queue:', error);
      // Fallback vers localStorage
      return this.fallbackRemoveFromLocalStorage(id);
    }
  }
  
  // Fallback pour supprimer depuis localStorage
  private static fallbackRemoveFromLocalStorage(id: string): boolean {
    try {
      const SYNC_QUEUE_KEY = 'nordagri_sync_queue';
      const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
      
      if (!queueJson) {
        return false;
      }
      
      const queue = JSON.parse(queueJson);
      const newQueue = queue.filter((item: SyncQueueItem) => item.id !== id);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
      return true;
    } catch (error) {
      console.error('Error in localStorage fallback remove:', error);
      return false;
    }
  }
  
  // Vider la file d'attente de synchronisation
  static async clearSyncQueue(): Promise<boolean> {
    try {
      const result = await indexedDBService.clearSyncQueue();
      
      // Aussi nettoyer localStorage par sécurité
      localStorage.removeItem('nordagri_sync_queue');
      
      return result;
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      // Fallback vers localStorage
      localStorage.removeItem('nordagri_sync_queue');
      return true;
    }
  }
  
  // Récupérer le nombre d'éléments dans la file d'attente
  static async getSyncQueueCount(): Promise<number> {
    try {
      return await indexedDBService.getSyncQueueCount();
    } catch (error) {
      console.error('Error getting sync queue count:', error);
      // Fallback vers localStorage
      const queueJson = localStorage.getItem('nordagri_sync_queue');
      return queueJson ? JSON.parse(queueJson).length : 0;
    }
  }
  
  // Marquer une tentative de synchronisation pour un élément
  static async markSyncAttempt(id: string): Promise<boolean> {
    try {
      const item = await this.getItemById(id);
      
      if (!item) {
        return false;
      }
      
      const updatedMeta = {
        attempts: (item.meta.attempts || 0) + 1,
        lastAttempt: Date.now()
      };
      
      return await indexedDBService.updateSyncQueueItem(id, {
        meta: updatedMeta
      });
    } catch (error) {
      console.error('Error marking sync attempt:', error);
      return false;
    }
  }
  
  // Marquer un conflit sur un élément
  static async markConflict(id: string, serverVersion?: string): Promise<boolean> {
    try {
      return await indexedDBService.updateSyncQueueItem(id, {
        meta: {
          conflictDetected: true,
          serverVersion
        }
      });
    } catch (error) {
      console.error('Error marking conflict:', error);
      return false;
    }
  }
  
  // Récupérer un élément par son ID
  static async getItemById(id: string): Promise<SyncQueueItemWithMeta | null> {
    try {
      const queue = await indexedDBService.getSyncQueue();
      return queue.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error getting item by ID:', error);
      return null;
    }
  }
  
  // Effectuer la synchronisation d'un élément
  static async syncItem(item: SyncQueueItemWithMeta): Promise<SyncResult> {
    console.log('Syncing item:', item.id, item.type);
    
    // Marquer la tentative
    await this.markSyncAttempt(item.id);
    
    try {
      let result: any;
      
      // Logique de synchronisation selon le type d'opération
      switch (item.type) {
        case 'add_intervention':
          result = await this.syncAddIntervention(item.data);
          break;
        case 'update_intervention':
          result = await this.syncUpdateIntervention(item.data);
          break;
        case 'delete_intervention':
          result = await this.syncDeleteIntervention(item.data);
          break;
        case 'add_time_entry':
          result = await this.syncAddTimeEntry(item.data);
          break;
        case 'update_time_entry':
          result = await this.syncUpdateTimeEntry(item.data);
          break;
        case 'delete_time_entry':
          result = await this.syncDeleteTimeEntry(item.data);
          break;
        case 'add_maintenance':
          result = await this.syncAddMaintenance(item.data);
          break;
        case 'update_maintenance':
          result = await this.syncUpdateMaintenance(item.data);
          break;
        case 'delete_maintenance':
          result = await this.syncDeleteMaintenance(item.data);
          break;
        default:
          throw new Error(`Type d'opération non pris en charge: ${item.type}`);
      }
      
      console.log('Sync success for item:', item.id, result);
      return { status: 'success', itemId: item.id };
    } catch (error: any) {
      console.error('Error syncing item:', item.id, error);
      
      // Vérifier si c'est un conflit de version
      if (error.message && error.message.includes('conflict')) {
        await this.markConflict(item.id, error.serverVersion);
        return { status: 'conflict', itemId: item.id, error };
      }
      
      return { status: 'error', itemId: item.id, error };
    }
  }
  
  // Méthodes spécifiques pour chaque type de synchronisation
  
  private static async syncAddIntervention(data: any): Promise<any> {
    // Implémenter la logique pour ajouter une intervention à Supabase
    const { data: result, error } = await supabase
      .from('interventions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  private static async syncUpdateIntervention(data: any): Promise<any> {
    // Vérifier la version du serveur pour détecter les conflits
    const { data: current, error: fetchError } = await supabase
      .from('interventions')
      .select('*')
      .eq('id', data.id)
      .single();

    if (fetchError) throw fetchError;
    
    // Vérifier s'il y a un conflit de version
    if (current && data.version && current.version > data.version) {
      throw {
        message: 'conflict_detected',
        serverVersion: current.version,
        serverData: current
      };
    }
    
    // Mettre à jour l'intervention avec incrémentation de version
    const { data: result, error } = await supabase
      .from('interventions')
      .update({
        ...data,
        version: (data.version || 0) + 1
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  private static async syncDeleteIntervention(data: any): Promise<any> {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', data.id);

    if (error) throw error;
    return { success: true };
  }
  
  // Méthodes pour les entrées de temps
  private static async syncAddTimeEntry(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('time_entries')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  private static async syncUpdateTimeEntry(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('time_entries')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  private static async syncDeleteTimeEntry(data: any): Promise<any> {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', data.id);

    if (error) throw error;
    return { success: true };
  }
  
  // Méthodes pour les tâches de maintenance
  private static async syncAddMaintenance(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('maintenance_tasks')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  private static async syncUpdateMaintenance(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('maintenance_tasks')
      .update(data)
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  private static async syncDeleteMaintenance(data: any): Promise<any> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', data.id);

    if (error) throw error;
    return { success: true };
  }
}

// Hook pour gérer la synchronisation en arrière-plan
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
  
  // Récupérer le nombre d'éléments en attente
  const refreshQueueCount = async () => {
    const count = await OfflineSyncService.getSyncQueueCount();
    setSyncCount(count);
  };

  // Fonction pour synchroniser les éléments en attente
  const syncPendingItems = async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline');
      return;
    }
    
    // Récupérer tous les éléments en attente
    const queue = await OfflineSyncService.getSyncQueue();
    
    if (queue.length === 0) {
      console.log('No items to sync');
      return;
    }
    
    setIsSyncing(true);
    setSyncCount(queue.length);
    
    toast({
      title: "Synchronisation en cours",
      description: `${queue.length} élément(s) en attente de synchronisation...`,
    });
    
    // Statistiques de synchronisation
    const stats: SyncStats = {
      total: queue.length,
      pending: queue.length,
      success: 0,
      error: 0,
      conflict: 0
    };
    
    // Synchroniser chaque élément
    for (const item of queue) {
      if (!isOnline) {
        console.log('Connection lost during sync, stopping');
        break;
      }
      
      const result = await OfflineSyncService.syncItem(item);
      
      // Mettre à jour les statistiques
      stats.pending--;
      stats[result.status]++;
      
      // Supprimer l'élément si synchronisé avec succès
      if (result.status === 'success') {
        await OfflineSyncService.removeFromSyncQueue(item.id);
      }
      
      // Mettre à jour les statistiques en cours
      setSyncStats({ ...stats });
    }
    
    // Mises à jour finales
    setIsSyncing(false);
    await refreshQueueCount();
    
    // Notification de fin
    if (stats.error === 0 && stats.conflict === 0) {
      toast.success("Synchronisation terminée", {
        description: `${stats.success} élément(s) synchronisé(s) avec succès.`
      });
    } else {
      toast.warning("Synchronisation terminée avec des problèmes", {
        description: `${stats.success} succès, ${stats.error} erreurs, ${stats.conflict} conflits.`
      });
    }
  };
  
  // Vérifier si des éléments sont en attente au chargement et lors de changements de connectivité
  useEffect(() => {
    refreshQueueCount();
    
    const checkQueue = async () => {
      await refreshQueueCount();
    };
    
    // Vérifier périodiquement le nombre d'éléments en attente
    const interval = setInterval(checkQueue, 30000);
    
    // Arrêter l'intervalle au démontage
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Réagir aux changements de connectivité
  useEffect(() => {
    if (isOnline) {
      // Lancer une synchronisation automatique quand on revient en ligne
      const timer = setTimeout(() => {
        syncPendingItems();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);
  
  return {
    isSyncing,
    syncCount,
    syncStats,
    syncPendingItems,
    refreshQueueCount
  };
}
