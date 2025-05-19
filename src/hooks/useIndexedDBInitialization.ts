
import { useEffect, useState } from 'react';
import { IndexedDBService } from '@/services/offline/indexedDBService';

export function useIndexedDBInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Check if database exists using static method
        const dbExists = await IndexedDBService.databaseExists();
        
        // If database doesn't exist, initialize it
        if (!dbExists) {
          // This will create the database with all stores
          await IndexedDBService.openDB();
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing IndexedDB:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };
    
    initializeDB();
  }, []);
  
  return { isInitialized, error };
}
