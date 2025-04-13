
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// Define the Intervention type to match both database and application structures
export interface Intervention {
  id: number;
  title: string;
  description?: string;
  equipment: string;
  equipmentId: number;
  location: string;
  date: Date;
  status: string;
  priority: string;
  technician: string;
  duration?: number;
  scheduledDuration?: number;
  notes?: string;
  partsUsed?: any[];
  coordinates?: any;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
}

export interface InterventionFormValues {
  title: string;
  description?: string;
  equipment: string;
  equipment_id: number;
  location: string;
  date: Date;
  status: string;
  priority: string;
  technician: string;
  duration?: number;
  scheduledDuration?: number;
  notes?: string;
  partsUsed?: any[];
}

export const useInterventionsData = () => {
  // Use react-query to fetch interventions with caching and refetching
  const fetchInterventions = async () => {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching interventions:', error);
      throw new Error('Failed to fetch interventions data');
    }
    
    // Map database response to our Intervention type
    const interventions: Intervention[] = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      equipment: item.equipment,
      equipmentId: item.equipment_id,
      location: item.location,
      date: new Date(item.date),
      status: item.status,
      priority: item.priority,
      technician: item.technician,
      duration: item.duration,
      scheduledDuration: item.scheduled_duration,
      notes: item.notes,
      partsUsed: item.parts_used,
      coordinates: item.coordinates,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      ownerId: item.owner_id
    }));
    
    return interventions;
  };

  const {
    data: interventions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: fetchInterventions
  });

  // Function to create a new intervention
  const createIntervention = async (formData: InterventionFormValues): Promise<Intervention> => {
    try {
      // Convert form data to database format
      const interventionData = {
        title: formData.title,
        description: formData.description,
        equipment: formData.equipment,
        equipment_id: formData.equipment_id,
        location: formData.location,
        date: formData.date.toISOString(),
        status: formData.status,
        priority: formData.priority,
        technician: formData.technician,
        duration: formData.duration,
        scheduled_duration: formData.scheduledDuration,
        notes: formData.notes,
        parts_used: formData.partsUsed || []
      };

      const { data, error } = await supabase
        .from('interventions')
        .insert(interventionData)
        .select()
        .single();

      if (error) throw error;

      // Refetch the interventions list to update UI
      refetch();
      
      // Convert database response back to our Intervention type
      const newIntervention: Intervention = {
        id: data.id,
        title: data.title,
        description: data.description,
        equipment: data.equipment,
        equipmentId: data.equipment_id,
        location: data.location,
        date: new Date(data.date),
        status: data.status,
        priority: data.priority,
        technician: data.technician,
        duration: data.duration,
        scheduledDuration: data.scheduled_duration,
        notes: data.notes,
        partsUsed: data.parts_used,
        coordinates: data.coordinates,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        ownerId: data.owner_id
      };
      
      return newIntervention;
    } catch (error) {
      console.error('Error creating intervention:', error);
      throw error;
    }
  };

  // Function to update intervention status
  const updateInterventionStatus = async (interventionId: number, newStatus: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ status: newStatus })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      refetch();
    } catch (error) {
      console.error(`Error updating intervention ${interventionId} status:`, error);
      throw error;
    }
  };

  // Function to assign technician
  const assignTechnician = async (interventionId: number, technicianName: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ technician: technicianName })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      refetch();
    } catch (error) {
      console.error(`Error assigning technician to intervention ${interventionId}:`, error);
      throw error;
    }
  };

  // Function to submit intervention report
  const submitInterventionReport = async (intervention: Partial<Intervention>): Promise<void> => {
    try {
      // Prepare the data for update, converting Date objects to ISO strings
      const updateData = {
        ...intervention,
        date: intervention.date instanceof Date ? intervention.date.toISOString() : intervention.date,
        status: 'completed'
      };
      
      // Remove readonly properties that shouldn't be sent in the update
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.ownerId;
      
      const { error } = await supabase
        .from('interventions')
        .update(updateData)
        .eq('id', intervention.id);

      if (error) throw error;
      
      // Refetch interventions to update UI
      refetch();
    } catch (error) {
      console.error(`Error submitting report for intervention ${intervention.id}:`, error);
      throw error;
    }
  };

  return {
    interventions,
    isLoading,
    error,
    refetch,
    createIntervention,
    updateInterventionStatus,
    assignTechnician,
    submitInterventionReport
  };
};
