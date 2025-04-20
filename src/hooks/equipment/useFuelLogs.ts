
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FuelLog, FuelLogFormValues } from '@/types/FuelLog';
import { toast } from 'sonner';
import { checkAuthStatus } from '@/utils/authUtils';

export function useFuelLogs(equipmentId: number) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: fuelLogs, isLoading } = useQuery({
    queryKey: ['fuelLogs', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_logs')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as FuelLog[];
    },
  });

  const addFuelLog = useMutation({
    mutationFn: async (values: FuelLogFormValues) => {
      try {
        // Récupérer la session utilisateur pour obtenir l'ID de l'utilisateur
        const { userId } = await checkAuthStatus();
        if (!userId) {
          throw new Error("Utilisateur non authentifié");
        }
        
        // Récupérer les informations de l'équipement et créer une valeur par défaut pour farm_id
        let farmId = null;
        
        // Tenter de récupérer farm_id de l'équipement
        try {
          const { data: equipmentData, error: equipmentError } = await supabase
            .from('equipment')
            .select('farm_id')
            .eq('id', equipmentId)
            .single();
          
          if (!equipmentError && equipmentData?.farm_id) {
            farmId = equipmentData.farm_id;
            console.log('Farm ID trouvé dans l\'équipement:', farmId);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des informations de l\'équipement:', error);
        }
        
        // Si farm_id n'est pas disponible, utiliser l'ID de ferme de l'utilisateur
        if (!farmId) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('farm_id')
              .eq('id', userId)
              .single();
              
            if (!profileError && profileData?.farm_id) {
              farmId = profileData.farm_id;
              console.log('Farm ID trouvé dans le profil utilisateur:', farmId);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil utilisateur:', error);
          }
        }
        
        // Si aucun farm_id trouvé, générer un UUID comme dernier recours
        if (!farmId) {
          console.log('Aucun farm_id trouvé, utilisation d\'un UUID généré');
          farmId = crypto.randomUUID();
        }
        
        console.log('Farm ID final utilisé pour l\'insertion:', farmId);
        
        // Insérer le plein de carburant
        const { data, error } = await supabase
          .from('fuel_logs')
          .insert([{
            equipment_id: equipmentId,
            date: values.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
            fuel_quantity_liters: values.fuel_quantity_liters,
            price_per_liter: values.price_per_liter,
            hours_at_fillup: values.hours_at_fillup || null,
            notes: values.notes || null,
            farm_id: farmId,
            created_by: userId
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error('Error adding fuel log:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', equipmentId] });
      toast.success('Plein enregistré avec succès');
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de l'enregistrement du plein");
      console.error('Error adding fuel log:', error);
    },
  });

  return {
    fuelLogs,
    isLoading,
    addFuelLog,
    isAddDialogOpen,
    setIsAddDialogOpen,
  };
}
