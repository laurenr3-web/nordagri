
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
      // Delete and recreate the database
      await IndexedDBMigrations.clearAllData();
      await IndexedDBMigrations.runMigrations();
      
      toast.success('La base de données locale a été réinitialisée. Veuillez rafraîchir la page.');
      
      // Force reload after a brief pause
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error resetting IndexedDB:', error);
      toast.error('Une erreur est survenue lors de la réinitialisation de la base de données');
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetDatabase,
    isResetting
  };
}
