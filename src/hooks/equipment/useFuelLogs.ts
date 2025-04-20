
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
        
        // Récupérer les informations de l'équipement pour obtenir farm_id
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('farm_id')
          .eq('id', equipmentId)
          .single();
        
        if (equipmentError) {
          console.error('Erreur lors de la récupération des informations de l\'équipement:', equipmentError);
          throw new Error("Impossible de récupérer les informations de l'équipement");
        }
        
        // Si farm_id n'est pas disponible, utiliser l'ID de ferme de l'utilisateur actuel
        let farmId = equipmentData?.farm_id;
        
        if (!farmId) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('farm_id')
            .eq('id', userId)
            .single();
            
          if (profileError) {
            console.error('Erreur lors de la récupération du profil utilisateur:', profileError);
          } else {
            farmId = profileData?.farm_id;
          }
          
          if (!farmId) {
            console.error('Aucun ID de ferme trouvé pour l\'équipement ou l\'utilisateur');
            throw new Error("Impossible de déterminer l'ID de la ferme");
          }
        }
        
        const { data, error } = await supabase
          .from('fuel_logs')
          .insert([{
            equipment_id: equipmentId,
            date: values.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
            fuel_quantity_liters: values.fuel_quantity_liters,
            price_per_liter: values.price_per_liter,
            hours_at_fillup: values.hours_at_fillup,
            notes: values.notes,
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
