
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
    await IndexedDBService.openDB(); // This will trigger the onupgradeneeded event if needed

    // Additional migrations could be added here if needed
    console.log('IndexedDB migrations completed');
  }

  /**
   * Clear all data from IndexedDB (useful for testing)
   */
  static async clearAllData(): Promise<void> {
    await IndexedDBService.openDB();
    
    // Clear each store
    await IndexedDBService.clearStore('syncOperations');
    await IndexedDBService.clearStore('offline_cache');
    await IndexedDBService.clearStore('form_drafts');
    
    console.log('IndexedDB data cleared');
  }
}
