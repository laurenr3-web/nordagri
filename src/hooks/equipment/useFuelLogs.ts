
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FuelLog, FuelLogFormValues } from '@/types/FuelLog';
import { toast } from 'sonner';
import { useFarmId } from '@/hooks/useFarmId';

export function useFuelLogs(equipmentId: number) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { farmId, isLoading: isFarmIdLoading } = useFarmId(equipmentId);

  const { data: fuelLogs, isLoading } = useQuery({
    queryKey: ['fuelLogs', equipmentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('fuel_logs')
          .select('*')
          .eq('equipment_id', equipmentId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des logs de carburant:', error);
          throw error;
        }
        return data as FuelLog[];
      } catch (error) {
        console.error('Exception lors du chargement des logs de carburant:', error);
        throw error;
      }
    },
    enabled: !!equipmentId,
  });

  const addFuelLog = useMutation({
    mutationFn: async (values: FuelLogFormValues) => {
      if (!farmId) {
        throw new Error("La ferme n'a pas pu être identifiée");
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('Erreur d\'authentification:', authError);
          throw new Error("Erreur d'authentification");
        }

        console.log('Submitting fuel log with farm_id:', farmId);
        console.log('User ID:', user.id);
        
        // Format the date as ISO string and extract just the date part (YYYY-MM-DD)
        const formattedDate = values.date.toISOString().split('T')[0];
        
        const newFuelLog = {
          equipment_id: equipmentId,
          date: formattedDate,
          fuel_quantity_liters: Number(values.fuel_quantity_liters),
          price_per_liter: Number(values.price_per_liter),
          hours_at_fillup: values.hours_at_fillup ? Number(values.hours_at_fillup) : null,
          km_at_fillup: values.km_at_fillup ? Number(values.km_at_fillup) : null,
          notes: values.notes || null,
          farm_id: farmId,
          created_by: user.id
        };
        
        console.log('Données à insérer:', newFuelLog);
        
        const { data, error } = await supabase
          .from('fuel_logs')
          .insert([newFuelLog])
          .select()
          .single();

        if (error) {
          console.error('Erreur lors de l\'insertion du log de carburant:', error);
          console.error('Code d\'erreur:', error.code);
          console.error('Message d\'erreur:', error.message);
          console.error('Détails:', error.details);
          throw error;
        }
        
        console.log('Log de carburant ajouté avec succès:', data);
        return data;
      } catch (error: any) {
        console.error('Exception lors de l\'ajout du plein:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate both the fuel logs and the equipment data to refresh them
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', equipmentId] });
      
      // Important: Invalidate the equipment data to get the updated hours/km values
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      
      // Also invalidate the general equipment list
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      let successMessage = 'Plein enregistré avec succès';
      
      // Add additional success message if hours or km were recorded
      if (data.hours_at_fillup || data.km_at_fillup) {
        successMessage += ' et compteurs mis à jour';
      }
      
      toast.success(successMessage);
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Erreur lors de l\'ajout du plein:', error);
      
      let errorMessage = "Erreur lors de l'enregistrement du plein";
      let description = error.message || "Une erreur s'est produite";
      
      if (error.message === "La ferme n'a pas pu être identifiée") {
        errorMessage = "Impossible d'enregistrer le plein";
        description = "La ferme n'a pas pu être identifiée. Veuillez réessayer plus tard.";
      } else if (error.message && error.message.includes("violates foreign key constraint")) {
        errorMessage = "Erreur de référence";
        description = "Une erreur est survenue avec la référence à l'équipement ou à la ferme.";
      } else if (error.message && error.message.includes("violates row-level security policy")) {
        errorMessage = "Erreur de permission";
        description = "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
      }
      
      toast.error(errorMessage, { description });
    },
  });

  // Mutation pour la suppression d'un plein
  const deleteFuelLog = useMutation({
    mutationFn: async (fuelLogId: string) => {
      const { error } = await supabase
        .from('fuel_logs')
        .delete()
        .eq('id', fuelLogId);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', equipmentId] });
      toast.success('Plein supprimé avec succès');
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression du plein:', error);
      toast.error("Erreur lors de la suppression du plein", {
        description: error.message || "Une erreur est survenue"
      });
    }
  });

  return {
    fuelLogs,
    isLoading,
    addFuelLog,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isFarmIdLoading,
    farmId,
    deleteFuelLog,
  };
}
