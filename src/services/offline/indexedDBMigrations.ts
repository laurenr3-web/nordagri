
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
      await IndexedDBService.openDB(); // This will trigger the onupgradeneeded event if needed
      console.log('IndexedDB migrations completed');
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
      // Delete the database entirely rather than just clearing stores
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(IndexedDBService.DB_NAME);
        
        deleteRequest.onerror = () => {
          reject(new Error('Could not delete database'));
        };
        
        deleteRequest.onsuccess = () => {
          console.log('Database deleted successfully');
          resolve();
        };
      });
      
      // Reinitialize the database with correct store structure
      await IndexedDBService.openDB();
      console.log('IndexedDB recreated with correct structure');
    } catch (error) {
      console.error('Error clearing IndexedDB data:', error);
      throw error;
    }
  }
}
