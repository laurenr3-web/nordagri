
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
    
    // Clear each store using the correct store names defined in IndexedDBService
    await IndexedDBService.clearStore('syncQueue'); // Changed from 'syncOperations' to 'syncQueue'
    await IndexedDBService.clearStore('offline_cache'); // Keep this as is
    await IndexedDBService.clearStore('formDrafts'); // Changed from 'form_drafts' to 'formDrafts'
    await IndexedDBService.clearStore('interventions'); // Add this store from IndexedDBService
    await IndexedDBService.clearStore('equipment'); // Add this store from IndexedDBService
    
    console.log('IndexedDB data cleared');
  }
}
