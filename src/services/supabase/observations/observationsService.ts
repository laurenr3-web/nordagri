
import { supabase } from '@/integrations/supabase/client';
import { FieldObservation } from '@/types/FieldObservation';

export const getObservationById = async (id: number): Promise<FieldObservation | null> => {
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching observation details:', error);
      throw error;
    }

    return data as FieldObservation;
  } catch (error) {
    console.error('Exception when fetching observation details:', error);
    throw error;
  }
};

export const deleteObservation = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting observation:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exception when deleting observation:', error);
    throw error;
  }
};
