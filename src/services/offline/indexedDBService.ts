
// Define basic IndexedDB service for storing and retrieving data offline
export class IndexedDBService {
  static DB_NAME = 'agri-erp-offline-db';
  static DB_VERSION = 1;
  private static dbConnection: IDBDatabase | null = null;
  
  /**
   * Get database connection (singleton pattern)
   * @returns Promise<IDBDatabase>
   */
  static async getDB(): Promise<IDBDatabase> {
    if (this.dbConnection && !this.dbConnection.closePending) {
      return this.dbConnection;
    }
    this.dbConnection = await this.openDB();
    return this.dbConnection;
  }
  
  /**
   * Check if the database exists
   * @returns Promise<boolean>
   */
  static async databaseExists(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.DB_NAME);
      
      request.onupgradeneeded = () => {
        // If onupgradeneeded is triggered, the database didn't exist previously
        // We need to abort this transaction to avoid partially creating it
        request.transaction?.abort();
        resolve(false);
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const storeNames = Array.from(db.objectStoreNames);
        db.close();
        
        // On considère que la base existe si elle a au moins un store
        resolve(storeNames.length > 0);
      };
      
      request.onerror = () => {
        console.error('Error checking if database exists:', request.error);
        resolve(false);
      };
    });
  }
  
  /**
   * Open database connection
   * @returns Promise<IDBDatabase>
   */
  static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      console.log(`Opening IndexedDB database: ${this.DB_NAME} (v${this.DB_VERSION})`);
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error('Error opening database:', error);
        reject(new Error(`Error opening database: ${error?.message || 'Unknown error'}`));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Database opened successfully, object stores:', Array.from(db.objectStoreNames));
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('Database upgrade needed, creating object stores');
        const db = (event.target as IDBOpenDBRequest).result;
        const existingStoreNames = Array.from(db.objectStoreNames);
        console.log('Existing stores:', existingStoreNames);
        
        // Create object stores with consistent names across the application
        if (!existingStoreNames.includes('formDrafts')) {
          console.log('Creating formDrafts store');
          db.createObjectStore('formDrafts', { keyPath: 'id' });
        }
        
        if (!existingStoreNames.includes('syncQueue')) {
          console.log('Creating syncQueue store');
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }

        if (!existingStoreNames.includes('interventions')) {
          console.log('Creating interventions store');
          const interventionsStore = db.createObjectStore('interventions', { keyPath: 'id' });
          interventionsStore.createIndex('status', 'status', { unique: false });
        }

        if (!existingStoreNames.includes('equipment')) {
          console.log('Creating equipment store');
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('status', 'status', { unique: false });
        }

        if (!existingStoreNames.includes('offline_cache')) {
          console.log('Creating offline_cache store');
          db.createObjectStore('offline_cache', { keyPath: 'key' });
        }

        // Ensure these store names are correctly defined for consistency
        if (!existingStoreNames.includes('equipment_options')) {
          console.log('Creating equipment_options store');
          db.createObjectStore('equipment_options', { keyPath: 'key' });
        }
        
        if (!existingStoreNames.includes('equipment_stats')) {
          console.log('Creating equipment_stats store');
          db.createObjectStore('equipment_stats', { keyPath: 'key' });
        }
        
        if (!existingStoreNames.includes('equipment_maintenance')) {
          console.log('Creating equipment_maintenance store');
          db.createObjectStore('equipment_maintenance', { keyPath: 'key' });
        }
      };
    });
  }
  
  /**
   * Add item to a store
   * @param storeName Store name
   * @param data Data to store
   * @returns Promise<any> with the generated ID
   */
  static async addToStore(storeName: string, data: any): Promise<any> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error adding to ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }

  /**
   * Update an item in a store
   * @param storeName Store name
   * @param data Data to update (must include the key)
   * @returns Promise<void>
   */
  static async updateInStore(storeName: string, data: any): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error updating in ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }
  
  /**
   * Update an item in a store by ID
   * @param storeName Store name
   * @param id Item ID
   * @param data Data to update
   * @returns Promise<void>
   */
  static async updateById(storeName: string, id: string | number, data: any): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // First, get the current item
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error(`Item with id ${id} not found in ${storeName}`));
          return;
        }
        
        // Merge with the new data
        const updatedItem = { ...item, ...data };
        
        // Put it back
        const putRequest = store.put(updatedItem);
        
        putRequest.onsuccess = () => {
          resolve();
        };
        
        putRequest.onerror = (event) => {
          reject(new Error(`Error updating item ${id} in ${storeName}: ${(event.target as IDBRequest).error?.message}`));
        };
      };
      
      getRequest.onerror = (event) => {
        reject(new Error(`Error getting item ${id} from ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }
  
  /**
   * Get an item from a store by ID
   * @param storeName Store name
   * @param id Item ID
   * @returns Promise<T | undefined>
   */
  static async getFromStore<T>(storeName: string, id: string | number): Promise<T | undefined> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error getting from ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }

  /**
   * Get an item by key
   * @param storeName Store name
   * @param key Key to search for
   * @returns Promise<T | undefined>
   */
  static async getByKey<T>(storeName: string, key: string): Promise<T | undefined> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error getting item by key ${key} from ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }

  /**
   * Get an item by index value
   * @param storeName Store name
   * @param indexName Index name
   * @param value Index value to search for
   * @returns Promise<T | undefined>
   */
  static async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T | undefined> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error getting by index from ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }
  
  /**
   * Delete an item from a store
   * @param storeName Store name
   * @param id Item ID
   * @returns Promise<void>
   */
  static async deleteFromStore(storeName: string, id: string | number): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error deleting from ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }
  
  /**
   * Get all items from a store
   * @param storeName Store name
   * @returns Promise<T[]>
   */
  static async getAllFromStore<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error getting all from ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }

  /**
   * Clear all items from a store
   * @param storeName Store name
   * @returns Promise<void>
   */
  static async clearStore(storeName: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(new Error(`Error clearing ${storeName}: ${(event.target as IDBRequest).error?.message}`));
      };
      
      transaction.oncomplete = () => {
        // Don't close the connection since we're using a singleton
      };
    });
  }

  /**
   * Clean up old data from stores
   * @param daysToKeep Number of days to keep data (default: 30)
   * @returns Promise<void>
   */
  static async cleanupOldData(daysToKeep = 30): Promise<void> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    const stores = ['syncQueue', 'offline_cache'];
    for (const storeName of stores) {
      try {
        const items = await this.getAllFromStore(storeName);
        for (const item of items) {
          if (item.createdAt && item.createdAt < cutoffDate) {
            await this.deleteFromStore(storeName, item.id || item.key);
          }
        }
      } catch (error) {
        console.error(`Error cleaning up old data from ${storeName}:`, error);
      }
    }
  }
}
