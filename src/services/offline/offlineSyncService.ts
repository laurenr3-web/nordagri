
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IndexedDBService } from './indexedDBService';
import { useEffect, useState } from 'react';

// Types for sync operations
export type SyncOperationType = 'add_intervention' | 'update_intervention' | 'delete_intervention' | 
                             'add_maintenance' | 'update_maintenance' | 'delete_maintenance' |
                             'add_part' | 'update_part' | 'delete_part' |
                             'add_equipment' | 'update_equipment' | 'delete_equipment' |
                             'add_time_entry' | 'update_time_entry' | 'delete_time_entry' |
                             'add_observation' | 'update_observation' | 'delete_observation';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  data: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'success' | 'error' | 'conflict';
  attempts: number;
  error?: string;
  meta?: SyncMeta;
}

interface SyncMeta {
  conflictDetected?: boolean;
  serverVersion?: string;
  attempts: number;
}

export interface SyncStats {
  total: number;
  pending: number;
  success: number;
  error: number;
  conflict: number;
}

// Service pour gérer la synchronisation hors-ligne
class OfflineSyncServiceClass {
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private dbInitialized = false;
  private maxRetryAttempts = 3;

  constructor() {
    this.initializeDB();
  }

  private async initializeDB() {
    try {
      await IndexedDBService.initialize();
      this.dbInitialized = true;
      await this.loadQueueFromStorage();
      console.log('Offline sync service initialized');
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  // Ajouter une opération à la file de synchronisation
  async addToSyncQueue(type: SyncOperationType, data: any): Promise<string> {
    // Attendre l'initialisation de la BD si nécessaire
    if (!this.dbInitialized) {
      await this.waitForDBInitialization();
    }

    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0
    };

    this.syncQueue.push(operation);
    
    // Sauvegarder l'opération dans IndexedDB
    await IndexedDBService.addItem('sync_operations', operation);
    
    return operation.id;
  }

  private async waitForDBInitialization() {
    return new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.dbInitialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  private async loadQueueFromStorage() {
    try {
      const storedOperations = await IndexedDBService.getAllItems('sync_operations');
      this.syncQueue = storedOperations;
      console.log(`Loaded ${this.syncQueue.length} operations from storage`);
    } catch (error) {
      console.error('Error loading sync queue from storage:', error);
    }
  }

  private async updateOperationInStorage(operation: SyncOperation) {
    try {
      await IndexedDBService.updateItem('sync_operations', operation);
    } catch (error) {
      console.error('Error updating operation in storage:', error);
    }
  }

  private async removeOperationFromStorage(operationId: string) {
    try {
      await IndexedDBService.deleteItem('sync_operations', operationId);
    } catch (error) {
      console.error('Error removing operation from storage:', error);
    }
  }

  // Obtenir le statut actuel de la file d'attente
  getQueueStatus(): SyncStats {
    const stats: SyncStats = {
      total: this.syncQueue.length,
      pending: 0,
      success: 0,
      error: 0,
      conflict: 0
    };

    this.syncQueue.forEach(op => {
      switch (op.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'success':
          stats.success++;
          break;
        case 'error':
          stats.error++;
          break;
        case 'conflict':
          stats.conflict++;
          break;
        default:
          break;
      }
    });

    return stats;
  }

  // Synchroniser toutes les opérations en attente
  async syncPendingOperations(): Promise<SyncStats> {
    if (this.isSyncing) return this.getQueueStatus();
    
    try {
      this.isSyncing = true;
      
      // Filtrer les opérations en attente
      const pendingOperations = this.syncQueue.filter(op => 
        op.status === 'pending' || (op.status === 'error' && op.attempts < this.maxRetryAttempts)
      );
      
      console.log(`Starting sync of ${pendingOperations.length} pending operations`);
      
      // Traiter chaque opération
      for (const operation of pendingOperations) {
        operation.status = 'processing';
        operation.attempts += 1;
        await this.updateOperationInStorage(operation);
        
        try {
          await this.processOperation(operation);
          
          // Supprimer l'opération réussie de la file et du stockage
          this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
          await this.removeOperationFromStorage(operation.id);
          
        } catch (error) {
          console.error(`Error processing operation ${operation.id}:`, error);
          
          // Mettre à jour le statut de l'opération
          operation.status = 'error';
          operation.error = error instanceof Error ? error.message : String(error);
          await this.updateOperationInStorage(operation);
        }
      }
      
      console.log('Sync completed');
      return this.getQueueStatus();
      
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    const { type, data } = operation;
    
    // Vérifier les conflits potentiels pour les mises à jour
    if (type.startsWith('update_')) {
      const hasConflict = await this.checkForConflicts(type, data);
      
      if (hasConflict) {
        operation.status = 'conflict';
        operation.meta = { 
          conflictDetected: true, 
          serverVersion: hasConflict,
          attempts: operation.attempts
        };
        await this.updateOperationInStorage(operation);
        return;
      }
    }

    switch (type) {
      // Opérations sur les interventions
      case 'add_intervention':
        await supabase.from('interventions').insert(data);
        break;
      case 'update_intervention':
        await supabase.from('interventions').update(data).eq('id', data.id);
        break;
      case 'delete_intervention':
        await supabase.from('interventions').delete().eq('id', data.id);
        break;
      
      // Opérations sur la maintenance
      case 'add_maintenance':
        await supabase.from('maintenance_tasks').insert(data);
        break;
      case 'update_maintenance':
        await supabase.from('maintenance_tasks').update(data).eq('id', data.id);
        break;
      case 'delete_maintenance':
        await supabase.from('maintenance_tasks').delete().eq('id', data.id);
        break;
      
      // Opérations sur les pièces
      case 'add_part':
        await supabase.from('parts').insert(data);
        break;
      case 'update_part':
        await supabase.from('parts').update(data).eq('id', data.id);
        break;
      case 'delete_part':
        await supabase.from('parts').delete().eq('id', data.id);
        break;

      // Opérations sur les équipements
      case 'add_equipment':
        await supabase.from('equipment').insert(data);
        break;
      case 'update_equipment':
        await supabase.from('equipment').update(data).eq('id', data.id);
        break;
      case 'delete_equipment':
        await supabase.from('equipment').delete().eq('id', data.id);
        break;
        
      // Opérations sur le suivi du temps
      case 'add_time_entry':
        await supabase.from('time_entries').insert(data);
        break;
      case 'update_time_entry': {
        // Exemple spécifique pour les entrées de temps
        const { id, ...updateData } = data;
        await supabase.from('time_entries').update(updateData).eq('id', id);
        break;
      }
      case 'delete_time_entry':
        await supabase.from('time_entries').delete().eq('id', data.id);
        break;
        
      // Opérations sur les observations
      case 'add_observation':
        await supabase.from('field_observations').insert(data);
        break;
      case 'update_observation':
        await supabase.from('field_observations').update(data).eq('id', data.id);
        break;
      case 'delete_observation':
        await supabase.from('field_observations').delete().eq('id', data.id);
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    operation.status = 'success';
  }

  // Vérifier s'il y a des conflits pour une mise à jour
  private async checkForConflicts(type: string, data: any): Promise<string | null> {
    // Extraire le nom de la table à partir du type d'opération
    const entityType = type.replace('update_', '');
    let tableName = '';
    
    // Mapper le type d'entité à la table correspondante
    switch (entityType) {
      case 'intervention':
        tableName = 'interventions';
        break;
      case 'maintenance':
        tableName = 'maintenance_tasks';
        break;
      case 'part':
        tableName = 'parts';
        break;
      case 'equipment':
        tableName = 'equipment';
        break;
      case 'time_entry':
        tableName = 'time_entries';
        break;
      case 'observation':
        tableName = 'field_observations';
        break;
      default:
        console.warn(`Unknown entity type for conflict check: ${entityType}`);
        return null;
    }
    
    try {
      // Récupérer la version serveur actuelle
      const { data: serverItem } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', data.id)
        .single();
      
      // Si l'élément n'existe plus sur le serveur, pas de conflit
      if (!serverItem) return null;
      
      // Pour les entités qui ont un champ version, on vérifie la version
      // Sinon, on utilise la date de modification ou de création
      if (Object.prototype.hasOwnProperty.call(data, 'version') && 
          Object.prototype.hasOwnProperty.call(serverItem, 'version')) {
        // Si la version locale est antérieure à la version serveur, il y a conflit
        return data.version !== serverItem.version ? serverItem.version : null;
      } else {
        // Utiliser updated_at ou created_at comme alternative
        const localTimestamp = data.updated_at || data.created_at;
        const serverTimestamp = serverItem.updated_at || serverItem.created_at;
        
        if (localTimestamp && serverTimestamp && new Date(localTimestamp) < new Date(serverTimestamp)) {
          return serverTimestamp;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error checking for conflicts:`, error);
      return null;
    }
  }
}

// Instance singleton du service de synchronisation
export const OfflineSyncService = new OfflineSyncServiceClass();

// Hook pour utiliser le gestionnaire de synchronisation
export function useOfflineSyncManager() {
  const [syncCount, setSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({ total: 0, pending: 0, success: 0, error: 0, conflict: 0 });
  
  // Charger le statut initial
  useEffect(() => {
    const loadInitialStatus = async () => {
      const stats = OfflineSyncService.getQueueStatus();
      setSyncCount(stats.pending);
      setSyncStats(stats);
    };
    
    loadInitialStatus();
    
    // Vérifier périodiquement le statut de synchronisation
    const intervalId = setInterval(() => {
      const stats = OfflineSyncService.getQueueStatus();
      setSyncCount(stats.pending);
      setSyncStats(stats);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Fonction pour déclencher la synchronisation
  const syncPendingItems = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const stats = await OfflineSyncService.syncPendingOperations();
      setSyncCount(stats.pending);
      setSyncStats(stats);
      
      // Afficher une notification de réussite/erreur
      if (stats.error > 0 || stats.conflict > 0) {
        toast.warning(`Synchronisation terminée avec des problèmes`, {
          description: `${stats.success} succès, ${stats.error} erreurs, ${stats.conflict} conflits`
        });
      } else if (stats.success > 0) {
        toast.success(`Synchronisation terminée`, {
          description: `${stats.success} élément(s) synchronisé(s)`
        });
      }
      
    } catch (error) {
      console.error('Error during synchronization:', error);
      toast.error('Erreur de synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  return { syncCount, isSyncing, syncStats, syncPendingItems };
}
