
import { useState } from 'react';
import { IndexedDBMigrations } from '@/services/offline/indexedDBMigrations';
import { toast } from 'sonner';

export function useResetIndexedDB() {
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Réinitialise IndexedDB en supprimant toutes les données et en recréant les stores
   * Cela peut résoudre les problèmes quand les noms de stores sont incohérents
   */
  const resetDatabase = async () => {
    setIsResetting(true);
    toast.info('Tentative de réparation de la base de données locale...');
    
    try {
      console.log('Début de la réinitialisation de la base de données...');
      
      // Première étape: vérifier si la base de données existe
      const exists = await IndexedDBMigrations.databaseExists();
      console.log('Base de données existe:', exists);
      
      // Supprimer et recréer la base de données
      await IndexedDBMigrations.clearAllData();
      console.log('Base de données supprimée avec succès');
      
      // Attendre un peu pour que la suppression soit complète
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await IndexedDBMigrations.runMigrations();
      console.log('Migrations de la base de données terminées');
      
      toast.success('La base de données locale a été réinitialisée. La page va se recharger.');
      
      // Forcer un rechargement après une courte pause
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation d\'IndexedDB:', error);
      
      // Message d'erreur plus détaillé
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
        console.error('Détail de l\'erreur:', error.stack);
      } else {
        toast.error('Une erreur est survenue lors de la réinitialisation de la base de données. Essayez d\'effacer vos données de navigation.');
      }
      
      // Suggérer de nettoyer manuellement
      toast.info('Vous pouvez aussi essayer de nettoyer manuellement le stockage dans les outils de développement de votre navigateur.');
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetDatabase,
    isResetting
  };
}
