
import { useState } from 'react';
import { IndexedDBMigrations } from '@/services/offline/indexedDBMigrations';
import { toast } from 'sonner';

export function useResetIndexedDB() {
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Reset IndexedDB by clearing all data and recreating stores
   * This can resolve issues when store names are inconsistent
   */
  const resetDatabase = async () => {
    setIsResetting(true);
    try {
      // First check if database exists
      const exists = await IndexedDBMigrations.databaseExists();
      console.log('Database exists:', exists);
      
      // Delete and recreate the database
      await IndexedDBMigrations.clearAllData();
      console.log('Database cleared successfully');
      
      await IndexedDBMigrations.runMigrations();
      console.log('Database migrations completed');
      
      toast.success('La base de données locale a été réinitialisée. La page va se recharger.');
      
      // Force reload after a brief pause
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error resetting IndexedDB:', error);
      toast.error('Une erreur est survenue lors de la réinitialisation de la base de données. Essayez d\'effacer vos données de navigation.');
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetDatabase,
    isResetting
  };
}
