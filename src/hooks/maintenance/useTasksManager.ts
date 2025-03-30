
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenancePriority, MaintenanceStatus, MaintenanceType } from './maintenanceSlice';

export function useTasksManager(initialTasks?: MaintenanceTask[]) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(initialTasks ? false : true);

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
      return;
    }

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // Simuler un appel API pour obtenir les tâches de maintenance
        setTimeout(() => {
          // Données fictives pour la démo
          const mockTasks: MaintenanceTask[] = [
            {
              id: 4,
              title: 'Brake System Check',
              equipment: 'New Holland T6.180',
              equipmentId: 1,
              type: 'preventive' as MaintenanceType,
              status: 'completed' as MaintenanceStatus,
              priority: 'medium' as MaintenancePriority,
              dueDate: new Date('2023-06-08'),
              completedDate: new Date('2023-06-08'),
              estimatedDuration: 2,
              actualDuration: 1.5,
              assignedTo: 'Michael Torres',
              notes: 'Routine inspection completed. Brake pads still in good condition.'
            },
            // ... autres tâches fictives
          ];
          
          setTasks(mockTasks);
          setIsLoading(false);
          console.info('Updated tasks state with Supabase data:', mockTasks);
        }, 1000);
      } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
        setIsLoading(false);
        toast.error('Impossible de charger les tâches de maintenance');
      }
    };

    fetchTasks();
  }, [initialTasks]);

  const addTask = (task: Omit<MaintenanceTask, 'id'>) => {
    // Ajouter une nouvelle tâche
    console.info('Adding task:', task);
    
    try {
      // Simuler l'envoi des données à l'API
      console.info('Adding task to Supabase:', task);
      
      // Générer un ID pour la nouvelle tâche (dans une vraie application, ce serait fait par le serveur)
      const newTask: MaintenanceTask = {
        ...task,
        id: Date.now() // Utiliser un timestamp comme ID temporaire
      };
      
      // Mettre à jour l'état local
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTaskStatus = (taskId: number, newStatus: MaintenanceStatus) => {
    // Mettre à jour le statut d'une tâche
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date() : task.completedDate
            } 
          : task
      )
    );
  };

  const updateTaskPriority = (taskId: number, newPriority: MaintenancePriority) => {
    // Mettre à jour la priorité d'une tâche
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, priority: newPriority } 
          : task
      )
    );
  };

  const deleteTask = (taskId: number) => {
    // Supprimer une tâche
    console.info('Deleting task with ID:', taskId);
    
    try {
      // Mettre à jour l'état local
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return { 
    tasks, 
    isLoading, 
    addTask, 
    updateTaskStatus, 
    updateTaskPriority,
    deleteTask
  };
}
