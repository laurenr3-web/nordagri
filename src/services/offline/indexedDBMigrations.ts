
/**
 * Service to handle IndexedDB migrations
 */
export class IndexedDBMigrations {
  private static DB_NAME = 'nordagri_offline_db';
  
  /**
   * Delete the entire database to force a clean rebuild
   */
  static async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.DB_NAME);
      
      request.onerror = (event) => {
        console.error('Error deleting database:', event);
        reject('Could not delete database');
      };
      
      request.onsuccess = () => {
        console.log('Database deleted successfully');
        resolve();
      };
    });
  }
  
  /**
   * Check if a database exists
   */
  static async databaseExists(): Promise<boolean> {
    return new Promise((resolve) => {
      // Try to open the database with version 1
      const request = indexedDB.open(this.DB_NAME);
      
      let exists = true;
      
      request.onupgradeneeded = () => {
        // If onupgradeneeded is called, the DB doesn't exist or needs upgrade
        exists = false;
        
        // Clean up - close and delete the database we just created
        request.transaction?.abort();
      };
      
      request.onerror = () => {
        resolve(false);
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.close();
        resolve(exists);
      };
    });
  }
  
  /**
   * Get database version
   */
  static async getDatabaseVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME);
      
      request.onerror = () => {
        reject('Could not open database');
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const version = db.version;
        db.close();
        resolve(version);
      };
    });
  }
  
  /**
   * List all object stores in the database
   */
  static async listObjectStores(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME);
      
      request.onerror = () => {
        reject('Could not open database');
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const storeNames = Array.from(db.objectStoreNames);
        db.close();
        resolve(storeNames);
      };
    });
  }
  
  /**
   * Get count of items in a store
   */
  static async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME);
      
      request.onerror = () => {
        reject('Could not open database');
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        try {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            resolve(countRequest.result);
          };
          
          countRequest.onerror = () => {
            reject(`Could not count items in ${storeName}`);
          };
          
          transaction.oncomplete = () => db.close();
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  }
}
