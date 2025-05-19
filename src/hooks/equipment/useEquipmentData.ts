
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';
import { IndexedDBService } from '@/services/offline/indexedDBService';
import { toast } from 'sonner';
import { useNetworkState } from '@/hooks/useNetworkState';
import { useState, useEffect } from 'react';

export function useEquipmentData() {
  const isOnline = useNetworkState();
  const [indexedDBError, setIndexedDBError] = useState<boolean>(false);
  
  // Vérifier l'état d'IndexedDB au chargement
  useEffect(() => {
    const checkIndexedDB = async () => {
      try {
        const exists = await IndexedDBService.databaseExists();
        console.log('IndexedDB Database exists:', exists);
        
        if (!exists) {
          console.log('IndexedDB Database does not exist, attempting to create it');
          await IndexedDBService.openDB();
          console.log('IndexedDB Database created successfully');
        }
      } catch (error) {
        console.error('Error checking IndexedDB:', error);
        setIndexedDBError(true);
      }
    };
    
    checkIndexedDB();
  }, []);

  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      console.log('Fetching equipment data, network status:', isOnline ? 'online' : 'offline');
      
      try {
        // Si IndexedDB a des problèmes, ne pas essayer de mettre en cache
        const skipCache = indexedDBError;
        
        // Récupérer les équipements depuis Supabase
        console.log('Fetching from Supabase...');
        const data = await equipmentService.getEquipment();
        console.log('Equipment data fetched:', data);
        
        // Si nous avons accès à IndexedDB, mettons en cache les données
        if (!skipCache && isOnline) {
          try {
            // Sauvegarder les données dans IndexedDB pour utilisation hors ligne
            const db = await IndexedDBService.openDB();
            const transaction = db.transaction(['equipment'], 'readwrite');
            const store = transaction.objectStore('equipment');
            
            // Vider le store avant d'ajouter les nouvelles données
            await IndexedDBService.clearStore('equipment');
            
            // Ajouter chaque équipement au store
            for (const item of data) {
              await IndexedDBService.addToStore('equipment', item);
            }
            
            console.log('Equipment data cached successfully');
          } catch (cacheError) {
            console.error('Failed to cache equipment data:', cacheError);
            // On continue même si le cache échoue
          }
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching equipment:', error);
        
        // En cas d'erreur et si nous sommes hors ligne, essayons de récupérer les données en cache
        if (!isOnline && !indexedDBError) {
          try {
            console.log('Trying to get equipment from IndexedDB cache...');
            const cachedData = await IndexedDBService.getAllFromStore('equipment');
            
            if (cachedData && cachedData.length > 0) {
              console.log('Using cached equipment data:', cachedData);
              return cachedData;
            } else {
              console.log('No cached equipment data found');
            }
          } catch (cacheError) {
            console.error('Error retrieving cached equipment:', cacheError);
          }
        }
        
        // Si tout échoue, afficher une notification et retourner un tableau vide
        toast.error("Impossible de récupérer les équipements. Veuillez vérifier votre connexion ou réparer la base de données locale.");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
