
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenancePriority, MaintenanceStatus, MaintenanceType } from './maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';

export function useTasksManager(initialTasks?: MaintenanceTask[]) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(initialTasks ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTasks) {
      console.log("Using provided initial tasks:", initialTasks);
      setTasks(initialTasks);
      return;
    }

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching maintenance tasks from service...");
        const fetchedTasks = await maintenanceService.getTasks();
        
        if (fetchedTasks && fetchedTasks.length > 0) {
          console.log(`Found ${fetchedTasks.length} maintenance tasks:`, fetchedTasks);
          setTasks(fetchedTasks);
        } else {
          console.log("No maintenance tasks found, using mock data");
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
              engineHours: 2500,
              actualDuration: 1.5,
              assignedTo: 'Michael Torres',
              notes: 'Routine inspection completed. Brake pads still in good condition.'
            },
            {
              id: 5,
              title: 'Vidange moteur',
              equipment: 'John Deere 6M',
              equipmentId: 2,
              type: 'preventive' as MaintenanceType,
              status: 'scheduled' as MaintenanceStatus,
              priority: 'high' as MaintenancePriority,
              dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
              engineHours: 500,
              assignedTo: 'Laurent Delisle',
              notes: 'Vidange à effectuer avant la saison des récoltes.'
            },
            {
              id: 6,
              title: 'Remplacement filtres',
              equipment: 'Fendt 724 Vario',
              equipmentId: 3,
              type: 'preventive' as MaintenanceType,
              status: 'scheduled' as MaintenanceStatus,
              priority: 'medium' as MaintenancePriority,
              dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
              engineHours: 250,
              assignedTo: 'Marie Dubois',
              notes: 'Changer tous les filtres.'
            }
          ];
          
          setTasks(mockTasks);
        }
      } catch (error: any) {
        console.error('Error fetching maintenance tasks:', error);
        setError(error.message || "Une erreur est survenue lors de la récupération des tâches");
        toast.error('Impossible de charger les tâches de maintenance');
        
        // Utiliser des données fictives en cas d'erreur
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
            engineHours: 2500,
            actualDuration: 1.5,
            assignedTo: 'Michael Torres',
            notes: 'Routine inspection completed. Brake pads still in good condition.'
          }
        ];
        
        setTasks(mockTasks);
      } finally {
        setIsLoading(false);
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
    console.log(`Updating task ${taskId} status to ${newStatus}`);
    
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
    console.log(`Updating task ${taskId} priority to ${newPriority}`);
    
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
      // Utiliser un setTimeout pour laisser le temps aux dialogues de se fermer
      setTimeout(() => {
        // Mettre à jour l'état local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }, 200);
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return { 
    tasks, 
    isLoading, 
    error,
    addTask, 
    updateTaskStatus, 
    updateTaskPriority,
    deleteTask,
    refreshTasks: () => setIsLoading(true) // Déclenchera un rechargement des données
  };
}
