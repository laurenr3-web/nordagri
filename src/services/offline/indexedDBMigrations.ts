
import { IndexedDBService } from './indexedDBService';

export class IndexedDBMigrations {
  /**
   * Check if the database exists
   */
  static async databaseExists(): Promise<boolean> {
    return IndexedDBService.databaseExists();
  }

  /**
   * Run all migrations to ensure database is up to date
   */
  static async runMigrations(): Promise<void> {
    try {
      console.log('Starting IndexedDB migrations...');
      const db = await IndexedDBService.openDB(); // This will trigger the onupgradeneeded event if needed
      console.log('IndexedDB migrations completed');
      
      // Vérifier que tous les stores nécessaires ont été créés
      const storeNames = Array.from(db.objectStoreNames);
      console.log('Available stores:', storeNames);
      
      // Liste des stores attendus
      const expectedStores = [
        'formDrafts',
        'syncQueue',
        'interventions', 
        'equipment',
        'offline_cache',
        'equipment_options',
        'equipment_stats',
        'equipment_maintenance'
      ];
      
      // Vérifier s'il manque des stores
      const missingStores = expectedStores.filter(
        store => !storeNames.includes(store)
      );
      
      if (missingStores.length > 0) {
        console.warn('Missing stores detected:', missingStores);
        console.warn('Need to recreate the database to ensure all stores exist');
        
        // Fermer la connexion avant de supprimer
        db.close();
        
        // Supprimer et recréer la base de données pour créer les stores manquants
        await this.clearAllData();
        await IndexedDBService.openDB();
      }
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Clear all data from IndexedDB (useful for testing)
   */
  static async clearAllData(): Promise<void> {
    try {
      console.log('Attempting to delete IndexedDB database:', IndexedDBService.DB_NAME);
      
      // Delete the database entirely rather than just clearing stores
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(IndexedDBService.DB_NAME);
        
        deleteRequest.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          console.error('Error deleting database:', error);
          reject(new Error(`Could not delete database: ${error?.message || 'Unknown error'}`));
        };
        
        deleteRequest.onblocked = () => {
          console.warn('Database deletion blocked, possibly due to open connections');
          // Try to continue anyway after a timeout
          setTimeout(resolve, 1000);
        };
        
        deleteRequest.onsuccess = () => {
          console.log('Database deleted successfully');
          resolve();
        };
      });
      
      console.log('Database deletion completed');
      
      // Wait a short time before recreating to ensure deletion is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reinitialize the database with correct store structure
      console.log('Recreating database with proper structure');
      await IndexedDBService.openDB();
      console.log('IndexedDB recreated with correct structure');
    } catch (error) {
      console.error('Error clearing IndexedDB data:', error);
      throw error;
    }
  }
}
