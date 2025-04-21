
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
      if (!farmId) {
        throw new Error("La ferme n'a pas pu être identifiée");
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Erreur d'authentification");
      }

      console.log('Submitting fuel log with farm_id:', farmId);
      
      const { data, error } = await supabase
        .from('fuel_logs')
        .insert([{
          equipment_id: equipmentId,
          date: values.date.toISOString().split('T')[0],
          fuel_quantity_liters: Number(values.fuel_quantity_liters),
          price_per_liter: Number(values.price_per_liter),
          hours_at_fillup: values.hours_at_fillup ? Number(values.hours_at_fillup) : null,
          notes: values.notes || null,
          farm_id: farmId,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting fuel log:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs', equipmentId] });
      toast.success('Plein enregistré avec succès');
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error('Error adding fuel log:', error);
      
      let errorMessage = "Erreur lors de l'enregistrement du plein";
      let description = error.message;
      
      if (error.message === "La ferme n'a pas pu être identifiée") {
        errorMessage = "Impossible d'enregistrer le plein";
        description = "La ferme n'a pas pu être identifiée. Veuillez réessayer plus tard.";
      } else if (error.message.includes("violates foreign key constraint")) {
        errorMessage = "Erreur de référence";
        description = "Une erreur est survenue avec la référence à l'équipement ou à la ferme.";
      }
      
      toast.error(errorMessage, { description });
    },
  });

  return {
    fuelLogs,
    isLoading,
    addFuelLog,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isFarmIdLoading
  };
}
