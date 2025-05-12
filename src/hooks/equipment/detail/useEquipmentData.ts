
import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/supabase/equipmentService';
import { toast } from 'sonner';

/**
 * Hook pour récupérer les données détaillées d'un équipement spécifique
 * 
 * Charge les informations complètes d'un équipement à partir de son ID, 
 * avec gestion des états de chargement et des erreurs.
 * 
 * @param {string | undefined} id - L'identifiant de l'équipement à récupérer
 * @returns {Object} Données de l'équipement, états de chargement et erreurs
 */
export function useEquipmentData(id: string | undefined) {
  const [equipment, setEquipment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Fetching equipment with ID:', id);
        const data = await equipmentService.getEquipmentById(Number(id));
        console.log('Fetched equipment data:', data);
        
        if (!data) {
          throw new Error('Équipement non trouvé');
        }
        
        // Ensure date fields are properly formatted as strings
        const processedData = {
          ...data,
          purchaseDate: data.purchaseDate 
            ? (typeof data.purchaseDate === 'object' 
               ? data.purchaseDate.toISOString() 
               : String(data.purchaseDate))
            : '',
        };
        
        setEquipment(processedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching equipment:', err);
        setError(err.message || 'Failed to load equipment');
        toast.error('Erreur lors du chargement de l\'équipement');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, [id]);

  return { 
    equipment, 
    setEquipment,
    loading, 
    error 
  };
}
