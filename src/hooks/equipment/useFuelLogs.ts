
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
      // Récupérer la session utilisateur pour obtenir l'ID de l'utilisateur
      const { userId } = await checkAuthStatus();
      if (!userId) {
        toast.error("Erreur d'authentification", {
          description: "Votre session a expiré. Veuillez vous reconnecter."
        });
        throw new Error("Utilisateur non authentifié");
      }
      
      // Récupérer les informations de l'équipement pour obtenir farm_id
      let farmId = null;
      
      console.log("Tentative de récupération du farm_id depuis l'équipement...");
      // 1. Tentative de récupération via l'équipement
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('farm_id')
        .eq('id', equipmentId)
        .single();
      
      if (equipmentError) {
        console.error('Erreur lors de la récupération des informations de l\'équipement:', equipmentError);
      } else if (equipmentData?.farm_id) {
        farmId = equipmentData.farm_id;
        console.log('Farm ID trouvé dans l\'équipement:', farmId);
      } else {
        console.log('Aucun farm_id trouvé dans l\'équipement');
      }
      
      // 2. Si aucun farm_id trouvé via l'équipement, essayer depuis le profil utilisateur
      if (!farmId) {
        console.log("Tentative de récupération du farm_id depuis le profil utilisateur...");
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error('Erreur lors de la récupération du profil utilisateur:', profileError);
        } else if (profileData?.farm_id) {
          farmId = profileData.farm_id;
          console.log('Farm ID trouvé dans le profil utilisateur:', farmId);
        } else {
          console.log('Aucun farm_id trouvé dans le profil utilisateur');
        }
      }
      
      // 3. Si toujours aucun farm_id, bloquer l'envoi et afficher une erreur
      if (!farmId) {
        console.error('Aucun farm_id trouvé pour l\'équipement ou l\'utilisateur');
        throw new Error("Impossible de déterminer l'ID de la ferme");
      }
      
      console.log('Farm ID utilisé pour l\'insertion:', farmId);
      
      // Insérer le plein de carburant
      const { data, error } = await supabase
        .from('fuel_logs')
        .insert([{
          equipment_id: equipmentId,
          date: values.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
          fuel_quantity_liters: Number(values.fuel_quantity_liters),
          price_per_liter: Number(values.price_per_liter),
          hours_at_fillup: values.hours_at_fillup ? Number(values.hours_at_fillup) : null,
          notes: values.notes || null,
          farm_id: farmId,
          created_by: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', equipmentId] });
      toast.success('Plein enregistré avec succès');
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      const errorMessage = error.message === "Impossible de déterminer l'ID de la ferme" 
        ? "Impossible d'enregistrer le plein : la ferme n'a pas pu être identifiée."
        : "Erreur lors de l'enregistrement du plein";
      
      toast.error(errorMessage, {
        description: error.message
      });
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
