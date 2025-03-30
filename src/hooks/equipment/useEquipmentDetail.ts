
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';
import { maintenanceService } from '@/services/supabase/maintenanceService';

export function useEquipmentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [equipment, setEquipment] = useState<any | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
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
        
        // Récupérer aussi les tâches de maintenance pour cet équipement
        try {
          const tasks = await maintenanceService.getTasks();
          // Filtrer pour ne garder que les tâches liées à cet équipement
          const equipmentTasks = tasks.filter(task => 
            task.equipmentId === Number(id) || 
            (task.equipment && task.equipment.toLowerCase() === data.name.toLowerCase())
          );
          console.log('Maintenance tasks for this equipment:', equipmentTasks);
          setMaintenanceTasks(equipmentTasks);
        } catch (err) {
          console.error('Error fetching maintenance tasks:', err);
          // Ne pas bloquer le chargement de l'équipement si les tâches ne sont pas disponibles
        }
        
        // Ensure date fields are properly formatted as strings and add UI-specific properties
        const processedData = {
          ...data,
          purchaseDate: data.purchaseDate 
            ? (typeof data.purchaseDate === 'object' 
               ? data.purchaseDate.toISOString() 
               : String(data.purchaseDate))
            : '',
          // Add UI-specific properties based on maintenance data
          lastMaintenance: getLastMaintenanceDate(maintenanceTasks),
          usage: { hours: data.usage?.hours || 0, target: data.usage?.target || 500 },
          nextService: getNextServiceInfo(maintenanceTasks)
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
  
  // Helper pour obtenir la date de la dernière maintenance
  const getLastMaintenanceDate = (tasks: any[]): string => {
    if (!tasks || tasks.length === 0) return 'N/A';
    
    const completedTasks = tasks.filter(task => 
      task.status === 'completed' && task.completedDate
    );
    
    if (completedTasks.length === 0) return 'N/A';
    
    // Trier par date de complétion (la plus récente d'abord)
    const sortedTasks = [...completedTasks].sort((a, b) => 
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
    );
    
    // Formater la date pour l'affichage
    return new Date(sortedTasks[0].completedDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Helper pour obtenir les informations du prochain service
  const getNextServiceInfo = (tasks: any[]): { type: string, due: string } => {
    if (!tasks || tasks.length === 0) {
      return { type: 'Regular maintenance', due: 'Non planifié' };
    }
    
    // Trouver les tâches planifiées (non complétées) et les trier par date d'échéance
    const scheduledTasks = tasks.filter(task => 
      task.status === 'scheduled' || task.status === 'in-progress'
    );
    
    if (scheduledTasks.length === 0) {
      return { type: 'Regular maintenance', due: 'Non planifié' };
    }
    
    // Trier par date d'échéance (la plus proche d'abord)
    const sortedTasks = [...scheduledTasks].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    
    const nextTask = sortedTasks[0];
    
    // Calculer le temps restant avant l'échéance
    const dueDate = new Date(nextTask.dueDate);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let dueText = '';
    if (daysRemaining < 0) {
      dueText = `En retard de ${Math.abs(daysRemaining)} jour(s)`;
    } else if (daysRemaining === 0) {
      dueText = 'Aujourd\'hui';
    } else if (daysRemaining === 1) {
      dueText = 'Demain';
    } else if (daysRemaining < 30) {
      dueText = `Dans ${daysRemaining} jour(s)`;
    } else {
      dueText = dueDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    
    return { 
      type: nextTask.title || nextTask.type || 'Maintenance', 
      due: dueText 
    };
  };
  
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
          nextService: prev.nextService || { type: 'Regular maintenance', due: 'Non planifié' }
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
    maintenanceTasks,
    loading, 
    error, 
    handleEquipmentUpdate 
  };
}
