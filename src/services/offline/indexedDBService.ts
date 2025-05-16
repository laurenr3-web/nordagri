
/**
 * Service to handle IndexedDB operations for offline storage
 */
export class IndexedDBService {
  private static DB_NAME = 'nordagri_offline_db';
  private static DB_VERSION = 1;
  private static SYNC_QUEUE_STORE = 'sync_queue';
  private static OFFLINE_CACHE_STORE = 'offline_cache';
  
  /**
   * Open IndexedDB database connection
   */
  static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event);
        reject('Could not open IndexedDB');
      };
      
      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create sync queue store with index on timestamp
        if (!db.objectStoreNames.contains(this.SYNC_QUEUE_STORE)) {
          const syncQueueStore = db.createObjectStore(this.SYNC_QUEUE_STORE, { keyPath: 'id' });
          syncQueueStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncQueueStore.createIndex('type', 'type', { unique: false });
        }
        
        // Create offline cache store
        if (!db.objectStoreNames.contains(this.OFFLINE_CACHE_STORE)) {
          const cacheStore = db.createObjectStore(this.OFFLINE_CACHE_STORE, { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
  
  /**
   * Add an item to a store
   */
  static async addToStore(storeName: string, item: any): Promise<string> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.add(item);
      
      request.onsuccess = () => {
        resolve(item.id || request.result as string);
      };
      
      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event);
        reject(`Failed to add item to ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
  
  /**
   * Get all items from a store
   */
  static async getAllFromStore<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting items from ${storeName}:`, event);
        reject(`Failed to get items from ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
  
  /**
   * Get item by key from a store
   */
  static async getByKey<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result as T || null);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event);
        reject(`Failed to get item from ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
  
  /**
   * Update an item in a store
   */
  static async updateInStore(storeName: string, item: any): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event);
        reject(`Failed to update item in ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
  
  /**
   * Delete an item from a store
   */
  static async deleteFromStore(storeName: string, key: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event);
        reject(`Failed to delete item from ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
  
  /**
   * Clear a store
   */
  static async clearStore(storeName: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Error clearing ${storeName}:`, event);
        reject(`Failed to clear ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
  
  /**
   * Get items by index
   */
  static async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const request = index.getAll(value);
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting items by index from ${storeName}:`, event);
        reject(`Failed to get items by index from ${storeName}`);
      };
      
      transaction.oncomplete = () => db.close();
    });
  }
}
