
import { useState, useEffect } from 'react';
import { maintenanceService } from '@/services/supabase/maintenanceService';

export function useMaintenanceTasks(id: string | undefined, equipment: any | null) {
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      if (!id || !equipment) {
        console.log('No ID or equipment provided for maintenance tasks');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching maintenance tasks for equipment ID ${id} (${equipment.name})`);
        setLoading(true);
        setError(null);
        
        // Essayons d'abord par equipmentId
        let tasks = await maintenanceService.getTasksForEquipment(Number(id));
        
        // Si aucune tâche n'est trouvée, récupérons toutes les tâches et filtrons-les
        if (!tasks || tasks.length === 0) {
          console.log('No tasks found by equipment ID, fetching all tasks to filter by name');
          const allTasks = await maintenanceService.getTasks();
          
          // Filtrer pour ne garder que les tâches liées à cet équipement par son nom
          tasks = allTasks.filter(task => 
            task.equipmentId === Number(id) || 
            (task.equipment && equipment.name && 
             task.equipment.toLowerCase() === equipment.name.toLowerCase())
          );
        }
        
        console.log('Maintenance tasks for this equipment:', tasks);
        setMaintenanceTasks(tasks);
      } catch (err: any) {
        console.error('Error fetching maintenance tasks:', err);
        setError(err.message || "Erreur lors de la récupération des tâches de maintenance");
        // Ne pas bloquer le chargement de l'équipement si les tâches ne sont pas disponibles
        setMaintenanceTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaintenanceTasks();
  }, [id, equipment]);

  return { maintenanceTasks, loading, error, refresh: () => setLoading(true) };
}
