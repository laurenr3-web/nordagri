
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type OfflineDataType = 'time_sessions' | 'fuel_logs';

interface StoredItem<T> {
  data: T;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handler pour les changements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connexion rétablie", { 
        description: "Synchronisation des données en cours..." 
      });
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Connexion perdue", { 
        description: "Les données seront synchronisées une fois la connexion rétablie." 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sauvegarder des données en mode hors-ligne
  const saveOfflineData = useCallback(<T>(type: OfflineDataType, data: T, id?: string): string => {
    try {
      // Générer un ID local si non fourni
      const localId = id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Récupérer les données existantes ou initialiser
      const existingDataStr = localStorage.getItem(`offline_${type}`) || '[]';
      const existingData: StoredItem<T>[] = JSON.parse(existingDataStr);
      
      // Ajouter la nouvelle donnée
      const newItem: StoredItem<T> = {
        data,
        timestamp: Date.now(),
        syncStatus: 'pending',
      };
      
      // Sauvegarder avec l'ID comme clé pour faciliter la récupération
      localStorage.setItem(`offline_${type}_${localId}`, JSON.stringify(newItem));
      
      // Ajouter l'ID à la liste pour suivi
      existingData.push(newItem);
      localStorage.setItem(`offline_${type}`, JSON.stringify(existingData.map(item => item.data)));
      
      toast.info("Donnée sauvegardée localement", { 
        description: "Elle sera synchronisée quand la connexion sera rétablie." 
      });
      
      return localId;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde hors ligne:", error);
      toast.error("Erreur de sauvegarde locale", { 
        description: "Impossible de sauvegarder les données en mode hors-ligne." 
      });
      return '';
    }
  }, []);

  // Récupérer des données hors-ligne
  const getOfflineData = useCallback(<T>(type: OfflineDataType, id?: string): T[] => {
    try {
      // Si un ID est fourni, récupérer cette entrée spécifique
      if (id) {
        const item = localStorage.getItem(`offline_${type}_${id}`);
        if (item) {
          const parsed: StoredItem<T> = JSON.parse(item);
          return [parsed.data];
        }
        return [];
      }
      
      // Sinon récupérer toutes les entrées
      const data = localStorage.getItem(`offline_${type}`) || '[]';
      return JSON.parse(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données hors ligne:", error);
      return [];
    }
  }, []);

  // Synchroniser les données une fois connecté
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) return;

    try {
      // Synchroniser les sessions de temps
      const timeSessions = getOfflineData('time_sessions');
      if (timeSessions.length > 0) {
        // La logique de synchronisation viendra ici, en utilisant les services Supabase
        // Pour l'instant, on simule juste la synchronisation
        console.log("Synchronisation des sessions de temps:", timeSessions);
        
        // Une fois synchronisé, on nettoie le stockage local
        localStorage.removeItem('offline_time_sessions');
        timeSessions.forEach((_, index) => {
          localStorage.removeItem(`offline_time_sessions_${index}`);
        });
        
        toast.success("Sessions de temps synchronisées", { 
          description: `${timeSessions.length} sessions ont été synchronisées.` 
        });
      }
      
      // Synchroniser les logs de carburant
      const fuelLogs = getOfflineData('fuel_logs');
      if (fuelLogs.length > 0) {
        // Logique similaire pour les fuel_logs
        console.log("Synchronisation des logs de carburant:", fuelLogs);
        
        localStorage.removeItem('offline_fuel_logs');
        fuelLogs.forEach((_, index) => {
          localStorage.removeItem(`offline_fuel_logs_${index}`);
        });
        
        toast.success("Logs de carburant synchronisés", { 
          description: `${fuelLogs.length} logs ont été synchronisés.` 
        });
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast.error("Erreur de synchronisation", { 
        description: "Certaines données n'ont pas pu être synchronisées." 
      });
    }
  }, [isOnline, getOfflineData]);

  return {
    isOnline,
    saveOfflineData,
    getOfflineData,
    syncOfflineData
  };
}
