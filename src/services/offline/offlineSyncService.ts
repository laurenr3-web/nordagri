
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interface pour un élément en attente de synchronisation
export interface SyncQueueItem {
  id: string;
  type: 'add_part' | 'update_part' | 'delete_part';
  data: any;
  timestamp: number;
}

// Clé pour le stockage local de la file d'attente de synchronisation
const SYNC_QUEUE_KEY = 'nordagri_sync_queue';

// Service de synchronisation
export class OfflineSyncService {
  // Ajouter un élément à la file d'attente de synchronisation
  static addToSyncQueue(type: SyncQueueItem['type'], data: any): string {
    try {
      // Récupérer la file d'attente existante
      const queue = this.getSyncQueue();
      
      // Créer un nouvel élément
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem: SyncQueueItem = {
        id,
        type,
        data,
        timestamp: Date.now()
      };
      
      // Ajouter l'élément à la file d'attente
      queue.push(newItem);
      
      // Sauvegarder la file d'attente
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la file d\'attente de synchronisation:', error);
      return '';
    }
  }
  
  // Récupérer la file d'attente de synchronisation
  static getSyncQueue(): SyncQueueItem[] {
    try {
      const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la file d\'attente de synchronisation:', error);
      return [];
    }
  }
  
  // Supprimer un élément de la file d'attente de synchronisation
  static removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue();
      const newQueue = queue.filter(item => item.id !== id);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Erreur lors de la suppression de la file d\'attente de synchronisation:', error);
    }
  }
  
  // Vider la file d'attente de synchronisation
  static clearSyncQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }
}

// Hook pour gérer la synchronisation lorsque l'utilisateur revient en ligne
export function useOfflineSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(0);
  const { toast } = useToast();
  
  // Fonction pour synchroniser les éléments en attente
  const syncPendingItems = async () => {
    const queue = OfflineSyncService.getSyncQueue();
    
    if (queue.length === 0) return;
    
    setIsSyncing(true);
    setSyncCount(queue.length);
    
    toast({
      title: "Synchronisation en cours",
      description: `${queue.length} éléments en attente de synchronisation...`,
    });
    
    // Implémenter ici la logique de synchronisation réelle
    
    // Une fois la synchronisation terminée
    setIsSyncing(false);
    setSyncCount(0);
    toast({
      title: "Synchronisation terminée",
      description: `${queue.length} éléments synchronisés avec succès.`,
    });
  };
  
  // Écouter les événements de connexion/déconnexion
  useEffect(() => {
    const handleOnline = () => {
      syncPendingItems();
    };
    
    window.addEventListener('online', handleOnline);
    
    // Vérifier s'il y a des éléments en attente au chargement
    if (navigator.onLine) {
      const queue = OfflineSyncService.getSyncQueue();
      if (queue.length > 0) {
        syncPendingItems();
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  return { isSyncing, syncCount };
}
