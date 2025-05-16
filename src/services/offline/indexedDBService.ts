
// Service pour gérer le stockage local avec IndexedDB
export class IndexedDBService {
  private static DB_NAME = 'nordagri_offline';
  private static DB_VERSION = 1;
  private static db: IDBDatabase | null = null;
  private static isInitializing = false;
  
  // Méthode d'initialisation de la base de données
  static async initialize(): Promise<void> {
    if (this.db) return;
    if (this.isInitializing) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.db) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    this.isInitializing = true;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      // Création/mise à jour de la structure de la base
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        
        // Store pour les opérations en attente de synchronisation
        if (!db.objectStoreNames.contains('sync_operations')) {
          const syncStore = db.createObjectStore('sync_operations', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store pour le cache des données
        if (!db.objectStoreNames.contains('data_cache')) {
          const cacheStore = db.createObjectStore('data_cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store pour les brouillons de formulaires
        if (!db.objectStoreNames.contains('form_drafts')) {
          const draftsStore = db.createObjectStore('form_drafts', { keyPath: 'id' });
          draftsStore.createIndex('formType', 'formType', { unique: false });
          draftsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      // Gestion des erreurs
      request.onerror = (event) => {
        console.error('IndexedDB initialization error:', event);
        this.isInitializing = false;
        reject(new Error('Failed to open IndexedDB'));
      };
      
      // Connexion réussie
      request.onsuccess = (event) => {
        this.db = (event.target as IDBRequest).result;
        console.log('IndexedDB initialized successfully');
        this.isInitializing = false;
        resolve();
      };
    });
  }
  
  // Méthode pour ajouter un élément à un store
  static async addItem(storeName: string, item: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.add(item);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event);
        reject(new Error(`Failed to add item to ${storeName}`));
      };
    });
  }
  
  // Méthode pour mettre à jour un élément dans un store
  static async updateItem(storeName: string, item: any): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(item);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event);
        reject(new Error(`Failed to update item in ${storeName}`));
      };
    });
  }
  
  // Méthode pour récupérer un élément par sa clé
  static async getItem(storeName: string, key: string | number): Promise<any> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event);
        reject(new Error(`Failed to get item from ${storeName}`));
      };
    });
  }
  
  // Méthode pour récupérer tous les éléments d'un store
  static async getAllItems(storeName: string): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error(`Error getting all items from ${storeName}:`, event);
        reject(new Error(`Failed to get all items from ${storeName}`));
      };
    });
  }
  
  // Méthode pour supprimer un élément d'un store
  static async deleteItem(storeName: string, key: string | number): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event);
        reject(new Error(`Failed to delete item from ${storeName}`));
      };
    });
  }
  
  // Méthode pour effacer tous les éléments d'un store
  static async clearStore(storeName: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error(`Error clearing ${storeName}:`, event);
        reject(new Error(`Failed to clear ${storeName}`));
      };
    });
  }
}
