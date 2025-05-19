
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
    const dbService = new IndexedDBService();
    await dbService.openDB(); // This will trigger the onupgradeneeded event if needed

    // Additional migrations could be added here if needed
    console.log('IndexedDB migrations completed');
  }

  /**
   * Clear all data from IndexedDB (useful for testing)
   */
  static async clearAllData(): Promise<void> {
    const dbService = new IndexedDBService();
    await dbService.openDB();
    
    // Clear each store
    await dbService.clearStore('syncOperations');
    await dbService.clearStore('offline_cache');
    await dbService.clearStore('form_drafts');
    
    console.log('IndexedDB data cleared');
  }
}
