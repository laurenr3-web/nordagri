
// Define basic IndexedDB service for storing and retrieving data offline
export class IndexedDBService {
  static DB_NAME = 'agri-erp-offline-db';
  static DB_VERSION = 1;
  
  /**
   * Open database connection
   * @returns Promise<IDBDatabase>
   */
  static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = (event) => {
        reject(new Error('Error opening database: ' + (event.target as IDBRequest).error?.message));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different types of data
        if (!db.objectStoreNames.contains('formDrafts')) {
          db.createObjectStore('formDrafts', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }

        // Add more stores as needed for offline functionality
        if (!db.objectStoreNames.contains('interventions')) {
          const interventionsStore = db.createObjectStore('interventions', { keyPath: 'id' });
          interventionsStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('status', 'status', { unique: false });
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
    const db = await this.openDB();
    
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
        db.close();
      };
    });
  }
  
  /**
   * Update an item in a store
   * @param storeName Store name
   * @param data Data to update
   * @returns Promise<void>
   */
  static async updateInStore(storeName: string, data: any): Promise<void> {
    const db = await this.openDB();
    
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
        db.close();
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
    const db = await this.openDB();
    
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
        db.close();
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
    const db = await this.openDB();
    
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
        db.close();
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
    const db = await this.openDB();
    
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
        db.close();
      };
    });
  }
  
  /**
   * Get all items from a store
   * @param storeName Store name
   * @returns Promise<T[]>
   */
  static async getAllFromStore<T>(storeName: string): Promise<T[]> {
    const db = await this.openDB();
    
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
        db.close();
      };
    });
  }

  /**
   * Clear all items from a store
   * @param storeName Store name
   * @returns Promise<void>
   */
  static async clearStore(storeName: string): Promise<void> {
    const db = await this.openDB();
    
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
        db.close();
      };
    });
  }
}
