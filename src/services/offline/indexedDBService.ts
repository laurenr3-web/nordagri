
/**
 * Service to handle IndexedDB operations for offline storage
 */
export class IndexedDBService {
  private static DB_NAME = 'nordagri_offline_db';
  private static DB_VERSION = 2; // Increased version to add new store
  private static SYNC_QUEUE_STORE = 'sync_queue';
  private static OFFLINE_CACHE_STORE = 'offline_cache';
  private static FORM_DRAFTS_STORE = 'form_drafts';
  private db: IDBDatabase | null = null;
  
  constructor(dbName?: string, dbVersion?: number) {
    if (dbName) {
      IndexedDBService.DB_NAME = dbName;
    }
    if (dbVersion) {
      IndexedDBService.DB_VERSION = dbVersion;
    }
  }
  
  /**
   * Open IndexedDB database connection
   */
  async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IndexedDBService.DB_NAME, IndexedDBService.DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event);
        reject('Could not open IndexedDB');
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        
        // Create sync operations store if it doesn't exist
        if (!db.objectStoreNames.contains('syncOperations')) {
          const syncStore = db.createObjectStore('syncOperations', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('entity', 'entity', { unique: false });
        }
        
        // Create offline cache store if it doesn't exist
        if (!db.objectStoreNames.contains('offline_cache')) {
          const cacheStore = db.createObjectStore('offline_cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
          cacheStore.createIndex('tableName', 'tableName', { unique: false });
        }
        
        // Create form drafts store if it doesn't exist (added in version 2)
        if (oldVersion < 2 && !db.objectStoreNames.contains('form_drafts')) {
          const draftsStore = db.createObjectStore('form_drafts', { keyPath: 'id' });
          draftsStore.createIndex('formType', 'formType', { unique: false });
          draftsStore.createIndex('lastSaved', 'lastSaved', { unique: false });
          draftsStore.createIndex('formId', 'formId', { unique: false });
        }
      };
    });
  }
  
  /**
   * Add an item to a store
   */
  async addToStore(storeName: string, item: any): Promise<string> {
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  /**
   * Get all items from a store
   */
  async getAllFromStore<T>(storeName: string): Promise<T[]> {
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  /**
   * Get item by key from a store
   */
  async getByKey<T>(storeName: string, key: string): Promise<T | null> {
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  /**
   * Update an item in a store
   */
  async updateInStore(storeName: string, key: string, updates: Partial<any>): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // First get the current item
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(`Item with key ${key} not found in ${storeName}`);
          return;
        }
        
        // Update with new values
        const updatedItem = { ...getRequest.result, ...updates };
        
        // Put back the updated item
        const putRequest = store.put(updatedItem);
        
        putRequest.onsuccess = () => {
          resolve();
        };
        
        putRequest.onerror = (event) => {
          console.error(`Error updating item in ${storeName}:`, event);
          reject(`Failed to update item in ${storeName}`);
        };
      };
      
      getRequest.onerror = (event) => {
        console.error(`Error getting item for update in ${storeName}:`, event);
        reject(`Failed to get item for update in ${storeName}`);
      };
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  /**
   * Delete an item from a store
   */
  async deleteFromStore(storeName: string, key: string): Promise<void> {
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  /**
   * Clear a store
   */
  async clearStore(storeName: string): Promise<void> {
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  /**
   * Get items by index
   */
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  // Static version for singleton usage
  static async updateInStore(storeName: string, item: any): Promise<void> {
    const instance = new IndexedDBService();
    const db = await instance.openDB();
    
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  // Static version for singleton usage
  static async getByKey<T>(storeName: string, key: string): Promise<T | null> {
    const instance = new IndexedDBService();
    const db = await instance.openDB();
    
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
      
      transaction.oncomplete = () => {
        // Do not close DB as it's a singleton
      };
    });
  }
  
  // Static helper for database existence check
  static async databaseExists(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.open(IndexedDBService.DB_NAME);
      
      request.onupgradeneeded = function() {
        // If onupgradeneeded is called, the database doesn't exist
        const db = request.result;
        db.close();
        indexedDB.deleteDatabase(IndexedDBService.DB_NAME);
        resolve(false);
      };
      
      request.onsuccess = function() {
        const db = request.result;
        db.close();
        resolve(true);
      };
      
      request.onerror = function() {
        resolve(false);
      };
    });
  }
}
