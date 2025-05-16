
/**
 * Service pour gérer les opérations IndexedDB
 * Permet de stocker les actions en attente de synchronisation dans une base de données locale
 */

// Définir le nom de la base de données et des stores
const DB_NAME = 'nordagri_offline_db';
const DB_VERSION = 1;
const SYNC_QUEUE_STORE = 'sync_queue';

// Interface pour les métadonnées de synchronisation
export interface SyncMeta {
  attempts: number;
  lastAttempt?: number;
  conflictDetected?: boolean;
  serverVersion?: string;
}

// Type pour un élément à synchroniser avec métadonnées
export type SyncQueueItemWithMeta = {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  meta: SyncMeta;
};

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialise la connexion à IndexedDB
   */
  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      console.log('Initializing IndexedDB...');
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = (event) => {
        console.log('IndexedDB opened successfully');
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        console.log('Creating IndexedDB stores...');
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Créer le store pour la file d'attente de synchronisation si nécessaire
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const store = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Ajoute un élément à la file d'attente de synchronisation
   */
  async addToSyncQueue(item: Omit<SyncQueueItemWithMeta, 'meta'> & { meta?: Partial<SyncMeta> }): Promise<string> {
    try {
      const db = await this.initDB();
      
      // Initialiser les métadonnées si non fournies
      const fullItem: SyncQueueItemWithMeta = {
        ...item,
        meta: {
          attempts: 0,
          ...(item.meta || {})
        }
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        
        const request = store.add(fullItem);
        
        request.onsuccess = () => {
          console.log('Item added to sync queue:', fullItem.id);
          resolve(fullItem.id);
        };
        
        request.onerror = (event) => {
          console.error('Error adding to sync queue:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB addToSyncQueue error:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les éléments de la file d'attente de synchronisation
   */
  async getSyncQueue(): Promise<SyncQueueItemWithMeta[]> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        const index = store.index('timestamp');
        
        const request = index.getAll();
        
        request.onsuccess = () => {
          resolve(request.result as SyncQueueItemWithMeta[]);
        };
        
        request.onerror = (event) => {
          console.error('Error getting sync queue:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB getSyncQueue error:', error);
      return [];
    }
  }

  /**
   * Met à jour un élément dans la file d'attente de synchronisation
   */
  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItemWithMeta>): Promise<boolean> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        
        // D'abord, récupérer l'élément existant
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          if (!getRequest.result) {
            resolve(false);
            return;
          }
          
          // Fusionner avec les mises à jour
          const updatedItem = {
            ...getRequest.result,
            ...updates,
            meta: {
              ...(getRequest.result.meta || {}),
              ...(updates.meta || {})
            }
          };
          
          // Mettre à jour l'élément
          const updateRequest = store.put(updatedItem);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = (event) => {
            console.error('Error updating sync item:', (event.target as IDBRequest).error);
            reject((event.target as IDBRequest).error);
          };
        };
        
        getRequest.onerror = (event) => {
          console.error('Error getting sync item for update:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB updateSyncQueueItem error:', error);
      return false;
    }
  }

  /**
   * Supprime un élément de la file d'attente de synchronisation
   */
  async removeFromSyncQueue(id: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('Item removed from sync queue:', id);
          resolve(true);
        };
        
        request.onerror = (event) => {
          console.error('Error removing from sync queue:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB removeFromSyncQueue error:', error);
      return false;
    }
  }

  /**
   * Efface tous les éléments de la file d'attente de synchronisation
   */
  async clearSyncQueue(): Promise<boolean> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('Sync queue cleared');
          resolve(true);
        };
        
        request.onerror = (event) => {
          console.error('Error clearing sync queue:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB clearSyncQueue error:', error);
      return false;
    }
  }

  /**
   * Récupère les éléments de la file d'attente filtrés par type
   */
  async getSyncQueueByType(type: string): Promise<SyncQueueItemWithMeta[]> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        const index = store.index('type');
        
        const request = index.getAll(IDBKeyRange.only(type));
        
        request.onsuccess = () => {
          resolve(request.result as SyncQueueItemWithMeta[]);
        };
        
        request.onerror = (event) => {
          console.error('Error getting sync queue by type:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB getSyncQueueByType error:', error);
      return [];
    }
  }

  /**
   * Récupère le nombre d'éléments dans la file d'attente
   */
  async getSyncQueueCount(): Promise<number> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
        const store = transaction.objectStore(SYNC_QUEUE_STORE);
        
        const request = store.count();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error('Error counting sync queue:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('IndexedDB getSyncQueueCount error:', error);
      return 0;
    }
  }
}

// Exporter une instance singleton
export const indexedDBService = new IndexedDBService();
