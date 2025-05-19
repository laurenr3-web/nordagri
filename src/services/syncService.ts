
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Types pour la synchronisation
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface SyncQueueItem {
  id: string;
  tableName: string;
  operationType: SyncOperationType;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  entityId?: string | number; // ID de l'entité concernée (pour les updates/deletes)
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
  itemId?: string;
  error?: any;
}

type SyncEventType = 'statusChange' | 'syncStart' | 'syncComplete' | 'syncError' | 'itemProcessed';
type SyncEventListener = (data: any) => void;

// Base de données IndexedDB pour la synchronisation
class SyncDatabase {
  private dbName = 'nordagri_sync_db';
  private version = 1;
  private queueStoreName = 'sync_queue';
  private cacheStoreName = 'data_cache';

  // Ouvre la connexion à la base de données
  async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error('Erreur d\'ouverture de la base IndexedDB:', event);
        reject(new Error('Impossible d\'ouvrir la base de données'));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Création du store pour la file d'attente de synchronisation
        if (!db.objectStoreNames.contains(this.queueStoreName)) {
          const queueStore = db.createObjectStore(this.queueStoreName, { keyPath: 'id' });
          queueStore.createIndex('tableName', 'tableName', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('operationType', 'operationType', { unique: false });
        }

        // Création du store pour le cache de données
        if (!db.objectStoreNames.contains(this.cacheStoreName)) {
          const cacheStore = db.createObjectStore(this.cacheStoreName, { keyPath: 'key' });
          cacheStore.createIndex('tableName', 'tableName', { unique: false });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });
  }

  // Ajoute un élément à la file d'attente de synchronisation
  async addToQueue(item: SyncQueueItem): Promise<string> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.queueStoreName, 'readwrite');
      const store = transaction.objectStore(this.queueStoreName);

      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item.id);
      };

      request.onerror = (event) => {
        reject(new Error('Erreur lors de l\'ajout à la file d\'attente'));
      };

      transaction.oncomplete = () => db.close();
    });
  }

  // Récupère tous les éléments de la file d'attente
  async getQueue(): Promise<SyncQueueItem[]> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.queueStoreName, 'readonly');
      const store = transaction.objectStore(this.queueStoreName);

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Erreur lors de la récupération de la file d\'attente'));
      };

      transaction.oncomplete = () => db.close();
    });
  }

  // Met à jour un élément dans la file d'attente
  async updateQueueItem(item: SyncQueueItem): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.queueStoreName, 'readwrite');
      const store = transaction.objectStore(this.queueStoreName);

      const request = store.put(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Erreur lors de la mise à jour de l\'élément'));
      };

      transaction.oncomplete = () => db.close();
    });
  }

  // Supprime un élément de la file d'attente
  async removeFromQueue(id: string): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.queueStoreName, 'readwrite');
      const store = transaction.objectStore(this.queueStoreName);

      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Erreur lors de la suppression de l\'élément'));
      };

      transaction.oncomplete = () => db.close();
    });
  }

  // Met en cache des données
  async setCache<T>(key: string, data: T, tableName: string): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.cacheStoreName, 'readwrite');
      const store = transaction.objectStore(this.cacheStoreName);

      const request = store.put({
        key,
        data,
        tableName,
        timestamp: Date.now()
      });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Erreur lors de la mise en cache des données'));
      };

      transaction.oncomplete = () => db.close();
    });
  }

  // Récupère des données du cache
  async getCache<T>(key: string): Promise<T | null> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.cacheStoreName, 'readonly');
      const store = transaction.objectStore(this.cacheStoreName);

      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error('Erreur lors de la récupération du cache'));
      };

      transaction.oncomplete = () => db.close();
    });
  }

  // Récupère tous les éléments du cache pour une table donnée
  async getCacheByTable<T>(tableName: string): Promise<Record<string, T>> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.cacheStoreName, 'readonly');
      const store = transaction.objectStore(this.cacheStoreName);
      const index = store.index('tableName');

      const request = index.getAll(tableName);

      request.onsuccess = () => {
        const results: Record<string, T> = {};
        if (request.result) {
          request.result.forEach(item => {
            results[item.key] = item.data;
          });
        }
        resolve(results);
      };

      request.onerror = () => {
        reject(new Error('Erreur lors de la récupération du cache par table'));
      };

      transaction.oncomplete = () => db.close();
    });
  }
}

// Service principal de synchronisation
export class SyncService {
  private static instance: SyncService;
  private db = new SyncDatabase();
  private supabase: SupabaseClient | null = null;
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingSyncCount: 0,
    lastSyncTime: null,
  };
  private eventListeners: Map<SyncEventType, SyncEventListener[]> = new Map();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxRetryCount = 5;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private connectionMonitorInterval: ReturnType<typeof setInterval> | null = null;

  // Singleton pattern
  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Constructeur privé pour Singleton
  private constructor() {
    this.initConnectionListeners();
    this.initConnectionMonitor();
    this.updatePendingSyncCount();
  }

  // Configure le client Supabase
  setSupabaseClient(client: SupabaseClient): void {
    this.supabase = client;
  }

  // Initialise les écouteurs de connexion
  private initConnectionListeners() {
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
  }

  // Initialise un moniteur de connexion plus fiable que navigator.onLine
  private initConnectionMonitor() {
    // Vérifier la connexion toutes les 30 secondes
    this.connectionMonitorInterval = setInterval(() => this.checkRealConnection(), 30000);
    // Vérifier immédiatement au démarrage
    this.checkRealConnection();
  }

  // Vérifie la connexion réelle avec un ping à la table health_check
  private async checkRealConnection(): Promise<boolean> {
    if (!this.supabase) return false;
    
    try {
      const start = Date.now();
      const { data, error } = await this.supabase
        .from('health_check')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      const isConnected = !error && Date.now() - start < 10000; // Timeout de 10s
      
      if (this.status.isOnline !== isConnected) {
        this.handleConnectionChange(isConnected);
      }
      
      return isConnected;
    } catch (e) {
      if (this.status.isOnline) {
        this.handleConnectionChange(false);
      }
      return false;
    }
  }

  // Gère les changements de connexion
  private handleConnectionChange(isOnline: boolean) {
    const wasOffline = !this.status.isOnline;
    this.status.isOnline = isOnline;
    
    this.emitEvent('statusChange', this.getStatus());
    
    // Si on est revenu en ligne, tenter une synchronisation
    if (isOnline && wasOffline) {
      // Attendre un peu pour s'assurer que la connexion est stable
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = setTimeout(() => {
        this.sync();
      }, 2000);
    }
  }

  // Met à jour le compteur d'opérations en attente
  private async updatePendingSyncCount(): Promise<void> {
    try {
      const queue = await this.db.getQueue();
      this.status.pendingSyncCount = queue.length;
      this.emitEvent('statusChange', this.getStatus());
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur de synchronisation:', error);
    }
  }

  // Récupère le statut actuel
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Ajoute une opération CREATE à la file d'attente
  async create(tableName: string, data: any): Promise<string> {
    if (!tableName) {
      throw new Error('Nom de table requis');
    }

    // Si en ligne et que Supabase est configuré, essayer d'abord l'opération directe
    if (this.status.isOnline && this.supabase) {
      try {
        const { data: result, error } = await this.supabase
          .from(tableName)
          .insert(data)
          .select()
          .single();

        if (!error) {
          return result.id;
        }
      } catch (e) {
        // En cas d'erreur, on continue avec le mode hors ligne
        console.warn('Échec de création en ligne, passage en mode hors ligne:', e);
      }
    }

    // Générer un ID temporaire pour l'élément
    const tempId = `local_${uuidv4()}`;
    const itemWithTempId = { ...data, id: tempId };

    // Ajouter à la file d'attente
    const queueItem: SyncQueueItem = {
      id: uuidv4(),
      tableName,
      operationType: SyncOperationType.CREATE,
      data: itemWithTempId,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db.addToQueue(queueItem);
    await this.updatePendingSyncCount();
    return tempId;
  }

  // Ajoute une opération UPDATE à la file d'attente
  async update(tableName: string, id: string | number, data: any): Promise<void> {
    if (!tableName || id === undefined) {
      throw new Error('Nom de table et ID requis');
    }

    // Si c'est un ID local, on met à jour dans la file d'attente
    if (typeof id === 'string' && id.startsWith('local_')) {
      // Trouver l'élément CREATE correspondant et mettre à jour ses données
      const queue = await this.db.getQueue();
      const createItem = queue.find(
        item => item.operationType === SyncOperationType.CREATE &&
               item.tableName === tableName &&
               item.data.id === id
      );

      if (createItem) {
        const updatedData = { ...createItem.data, ...data };
        const updatedItem = { ...createItem, data: updatedData };
        await this.db.updateQueueItem(updatedItem);
        await this.updatePendingSyncCount();
        return;
      }
    }

    // Si en ligne et que Supabase est configuré, essayer d'abord l'opération directe
    if (this.status.isOnline && this.supabase) {
      try {
        const { error } = await this.supabase
          .from(tableName)
          .update(data)
          .eq('id', id);

        if (!error) {
          return;
        }
      } catch (e) {
        // En cas d'erreur, on continue avec le mode hors ligne
        console.warn('Échec de mise à jour en ligne, passage en mode hors ligne:', e);
      }
    }

    // Ajouter à la file d'attente
    const queueItem: SyncQueueItem = {
      id: uuidv4(),
      tableName,
      operationType: SyncOperationType.UPDATE,
      data,
      entityId: id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db.addToQueue(queueItem);
    await this.updatePendingSyncCount();
  }

  // Ajoute une opération DELETE à la file d'attente
  async delete(tableName: string, id: string | number): Promise<void> {
    if (!tableName || id === undefined) {
      throw new Error('Nom de table et ID requis');
    }

    // Si c'est un ID local, on supprime de la file d'attente
    if (typeof id === 'string' && id.startsWith('local_')) {
      const queue = await this.db.getQueue();
      const createItem = queue.find(
        item => item.operationType === SyncOperationType.CREATE &&
               item.tableName === tableName &&
               item.data.id === id
      );

      if (createItem) {
        await this.db.removeFromQueue(createItem.id);
        await this.updatePendingSyncCount();
        return;
      }
    }

    // Si en ligne et que Supabase est configuré, essayer d'abord l'opération directe
    if (this.status.isOnline && this.supabase) {
      try {
        const { error } = await this.supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (!error) {
          return;
        }
      } catch (e) {
        // En cas d'erreur, on continue avec le mode hors ligne
        console.warn('Échec de suppression en ligne, passage en mode hors ligne:', e);
      }
    }

    // Ajouter à la file d'attente
    const queueItem: SyncQueueItem = {
      id: uuidv4(),
      tableName,
      operationType: SyncOperationType.DELETE,
      data: null,
      entityId: id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db.addToQueue(queueItem);
    await this.updatePendingSyncCount();
  }

  // Cache les résultats d'une requête
  async cacheQueryResult<T>(key: string, data: T, tableName: string): Promise<void> {
    await this.db.setCache<T>(key, data, tableName);
  }

  // Récupère les résultats du cache
  async getCachedQueryResult<T>(key: string): Promise<T | null> {
    return await this.db.getCache<T>(key);
  }

  // Lance la synchronisation
  async sync(): Promise<SyncResult[]> {
    if (!this.supabase) {
      return [{ success: false, message: 'Client Supabase non configuré' }];
    }

    if (!this.status.isOnline) {
      return [{ success: false, message: 'Hors ligne' }];
    }

    if (this.status.isSyncing) {
      return [{ success: false, message: 'Synchronisation déjà en cours' }];
    }

    this.status.isSyncing = true;
    this.emitEvent('syncStart', null);

    try {
      // Obtenir les éléments de la file d'attente, triés par timestamp
      const queue = await this.db.getQueue();
      queue.sort((a, b) => a.timestamp - b.timestamp);

      const results: SyncResult[] = [];

      // Traiter chaque élément
      for (const item of queue) {
        try {
          const result = await this.processQueueItem(item);
          results.push(result);
          this.emitEvent('itemProcessed', result);
          
          if (result.success) {
            await this.db.removeFromQueue(item.id);
          } else {
            // Incrémenter le compteur de tentatives
            if (item.retryCount < this.maxRetryCount) {
              const updatedItem = { ...item, retryCount: item.retryCount + 1 };
              await this.db.updateQueueItem(updatedItem);
            } else {
              // Si trop de tentatives, retirer de la file et notifier
              await this.db.removeFromQueue(item.id);
              toast.error(`Échec de synchronisation après ${this.maxRetryCount} tentatives`, {
                description: `Table: ${item.tableName}, Opération: ${item.operationType}`
              });
            }
          }
        } catch (error) {
          console.error('Erreur lors du traitement d\'un élément de la file:', error);
          results.push({
            success: false,
            itemId: item.id,
            message: `Erreur lors du traitement: ${error.message || 'Erreur inconnue'}`
          });
        }
      }

      this.status.lastSyncTime = new Date();
      await this.updatePendingSyncCount();
      this.emitEvent('syncComplete', results);

      return results;
    } catch (error) {
      const errorMessage = `Erreur de synchronisation: ${error.message || 'Erreur inconnue'}`;
      console.error(errorMessage, error);
      this.emitEvent('syncError', error);
      return [{ success: false, message: errorMessage, error }];
    } finally {
      this.status.isSyncing = false;
      this.emitEvent('statusChange', this.getStatus());
    }
  }

  // Traite un élément de la file d'attente
  private async processQueueItem(item: SyncQueueItem): Promise<SyncResult> {
    if (!this.supabase) {
      return { success: false, message: 'Client Supabase non configuré', itemId: item.id };
    }

    try {
      switch (item.operationType) {
        case SyncOperationType.CREATE:
          return await this.processCreateOperation(item);
        case SyncOperationType.UPDATE:
          return await this.processUpdateOperation(item);
        case SyncOperationType.DELETE:
          return await this.processDeleteOperation(item);
        default:
          return {
            success: false,
            message: `Type d'opération non pris en charge: ${item.operationType}`,
            itemId: item.id
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du traitement de l'élément ${item.id}: ${error.message}`,
        itemId: item.id,
        error
      };
    }
  }

  // Traite une opération CREATE
  private async processCreateOperation(item: SyncQueueItem): Promise<SyncResult> {
    const { tableName, data } = item;

    // Enlever l'ID temporaire avant insertion
    const { id: tempId, ...dataWithoutTempId } = data;

    const { data: result, error } = await this.supabase!
      .from(tableName)
      .insert(dataWithoutTempId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur CREATE: ${error.message}`);
    }

    // Mettre à jour les mappings d'ID local/serveur
    // Cela pourrait être utilisé pour mettre à jour les références locales
    // dans d'autres entrées en attente

    return {
      success: true,
      message: `Élément créé dans ${tableName}`,
      itemId: item.id
    };
  }

  // Traite une opération UPDATE
  private async processUpdateOperation(item: SyncQueueItem): Promise<SyncResult> {
    const { tableName, data, entityId } = item;

    const { error } = await this.supabase!
      .from(tableName)
      .update(data)
      .eq('id', entityId!);

    if (error) {
      throw new Error(`Erreur UPDATE: ${error.message}`);
    }

    return {
      success: true,
      message: `Élément mis à jour dans ${tableName}`,
      itemId: item.id
    };
  }

  // Traite une opération DELETE
  private async processDeleteOperation(item: SyncQueueItem): Promise<SyncResult> {
    const { tableName, entityId } = item;

    const { error } = await this.supabase!
      .from(tableName)
      .delete()
      .eq('id', entityId!);

    if (error) {
      throw new Error(`Erreur DELETE: ${error.message}`);
    }

    return {
      success: true,
      message: `Élément supprimé de ${tableName}`,
      itemId: item.id
    };
  }

  // Démarre la synchronisation périodique
  startPeriodicSync(intervalMs: number = 60000): void {
    this.stopPeriodicSync();
    this.syncInterval = setInterval(() => {
      if (this.status.isOnline && !this.status.isSyncing && this.status.pendingSyncCount > 0) {
        this.sync();
      }
    }, intervalMs);
  }

  // Arrête la synchronisation périodique
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Ajoute un écouteur d'événement
  addEventListener(event: SyncEventType, listener: SyncEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  // Supprime un écouteur d'événement
  removeEventListener(event: SyncEventType, listener: SyncEventListener): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event)!;
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  // Émet un événement
  private emitEvent(event: SyncEventType, data: any): void {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event)!;
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Erreur dans un écouteur d'événement ${event}:`, error);
      }
    });
  }

  // Nettoie les ressources du service
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.connectionMonitorInterval) {
      clearInterval(this.connectionMonitorInterval);
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    window.removeEventListener('online', () => this.handleConnectionChange(true));
    window.removeEventListener('offline', () => this.handleConnectionChange(false));
    
    this.eventListeners.clear();
  }
}

// Export d'une instance du service de synchronisation
export const syncService = SyncService.getInstance();
