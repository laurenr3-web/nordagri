import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';

export function useEquipmentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
        
        // Ensure date fields are properly formatted as strings and add UI-specific properties
        const processedData = {
          ...data,
          purchaseDate: data.purchaseDate 
            ? (typeof data.purchaseDate === 'object' 
               ? data.purchaseDate.toISOString() 
               : String(data.purchaseDate))
            : '',
          // Add UI-specific properties
          lastMaintenance: 'N/A', // Default value
          usage: { hours: 0, target: 500 },
          nextService: { type: 'Regular maintenance', due: 'In 30 days' }
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
  
  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      console.log('Updating equipment:', updatedEquipment);
      setLoading(true);
      
      // Remove any UI-specific properties before sending to the server
      const { usage, nextService, lastMaintenance, ...equipmentForUpdate } = updatedEquipment;
      
      const result = await equipmentService.updateEquipment(equipmentForUpdate);
      console.log('Update result:', result);
      
      // Update local state with the result from the server
      setEquipment(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          ...result,
          // Convert potential Date objects to strings for UI display
          purchaseDate: result.purchaseDate 
            ? (typeof result.purchaseDate === 'object' 
               ? result.purchaseDate.toISOString() 
               : String(result.purchaseDate))
            : prev.purchaseDate || '',
          // Keep UI-specific properties
          lastMaintenance: prev.lastMaintenance || 'N/A',
          usage: prev.usage || { hours: 0, target: 500 },
          nextService: prev.nextService || { type: 'Regular maintenance', due: 'In 30 days' }
        };
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', Number(id)] });
      
      toast.success('Équipement mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    equipment, 
    loading, 
    error, 
    handleEquipmentUpdate 
  };
}
