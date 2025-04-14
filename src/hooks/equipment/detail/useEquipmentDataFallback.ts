
import { useState, useEffect } from 'react';
import { Equipment } from '@/services/supabase/equipment/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapEquipmentFromDatabase } from '@/services/supabase/equipment/mappers';

/**
 * Hook de secours pour charger les données d'un équipement directement depuis la base de données
 * lorsque le hook principal échoue. Ceci est une solution temporaire pour garantir
 * que les utilisateurs peuvent accéder aux données même en cas d'erreur.
 */
export function useEquipmentDataFallback(id: string | number | undefined) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Ne rien faire si l'ID n'est pas défini
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    async function fetchEquipmentDirectly() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convertir l'ID en nombre si c'est une chaîne
        const equipmentId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        if (isNaN(equipmentId)) {
          throw new Error('ID d\'équipement non valide');
        }
        
        // Requête directe à Supabase sur la table equipment (singulier)
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', equipmentId)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Équipement non trouvé');
        
        // Utiliser le mapper pour convertir correctement les données
        const formattedEquipment = mapEquipmentFromDatabase(data);
        
        setEquipment(formattedEquipment);
      } catch (err) {
        console.error('Erreur lors du chargement de secours de l\'équipement:', err);
        setError(err instanceof Error ? err : new Error('Une erreur inconnue s\'est produite'));
        toast.error('Erreur de chargement des données', {
          description: 'Impossible de charger les détails de l\'équipement.'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEquipmentDirectly();
  }, [id]);
  
  return { equipment, isLoading, error };
}
