
import { useState, useEffect } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';

export function useMaintenanceTasks(id: string | undefined, equipment: any | null) {
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      if (!id || !equipment) return;
      
      try {
        const tasks = await maintenanceService.getTasks();
        // Filtrer pour ne garder que les tâches liées à cet équipement
        const equipmentTasks = tasks.filter(task => 
          task.equipmentId === Number(id) || 
          (task.equipment && task.equipment.toLowerCase() === equipment.name.toLowerCase())
        );
        console.log('Maintenance tasks for this equipment:', equipmentTasks);
        setMaintenanceTasks(equipmentTasks);
      } catch (err) {
        console.error('Error fetching maintenance tasks:', err);
        // Ne pas bloquer le chargement de l'équipement si les tâches ne sont pas disponibles
      }
    };
    
    fetchMaintenanceTasks();
  }, [id, equipment]);

  return { maintenanceTasks };
}
