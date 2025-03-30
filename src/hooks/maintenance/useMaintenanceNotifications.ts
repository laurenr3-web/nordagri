
import { useState, useEffect } from 'react';
import { MaintenanceTask } from './maintenanceSlice';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addDays, format, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour les notifications de maintenance
interface MaintenanceNotification {
  id: number;
  taskId: number;
  title: string;
  equipment: string;
  dueDate: Date;
  status: 'upcoming' | 'overdue' | 'today';
  priority: string;
  read: boolean;
}

export function useMaintenanceNotifications() {
  const [notifications, setNotifications] = useState<MaintenanceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Charger les tâches de maintenance à venir
  useEffect(() => {
    const loadMaintenanceTasks = async () => {
      try {
        setLoading(true);
        
        // Récupérer les tâches de maintenance depuis Supabase
        const { data, error } = await supabase
          .from('maintenance_tasks')
          .select('*')
          .in('status', ['scheduled', 'in-progress']);
        
        if (error) throw error;
        
        // Convertir les données en tâches
        const tasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          equipment: task.equipment,
          equipmentId: task.equipment_id,
          type: task.type,
          status: task.status,
          priority: task.priority,
          dueDate: new Date(task.due_date),
          engineHours: task.estimated_duration,
          assignedTo: task.assigned_to || '',
          notes: task.notes || ''
        }));
        
        // Créer des notifications pour les tâches à venir dans les 7 prochains jours
        // ou en retard
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = addDays(today, 7);
        nextWeek.setHours(23, 59, 59, 999);
        
        const newNotifications: MaintenanceNotification[] = [];
        
        tasks.forEach(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          
          let status: 'upcoming' | 'overdue' | 'today';
          
          if (taskDate.getTime() < today.getTime()) {
            status = 'overdue';
          } else if (taskDate.getTime() === today.getTime()) {
            status = 'today';
          } else if (isWithinInterval(taskDate, { start: today, end: nextWeek })) {
            status = 'upcoming';
          } else {
            // Tâche pas encore à notifier
            return;
          }
          
          newNotifications.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            taskId: task.id,
            title: task.title,
            equipment: task.equipment,
            dueDate: task.dueDate,
            status,
            priority: task.priority,
            read: false
          });
        });
        
        // Trier les notifications (en retard, aujourd'hui, à venir)
        newNotifications.sort((a, b) => {
          // D'abord par statut
          const statusOrder = { overdue: 0, today: 1, upcoming: 2 };
          const statusComparison = statusOrder[a.status] - statusOrder[b.status];
          if (statusComparison !== 0) return statusComparison;
          
          // Ensuite par priorité
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
          const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
          const priorityComparison = priorityA - priorityB;
          if (priorityComparison !== 0) return priorityComparison;
          
          // Enfin par date d'échéance
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        
        setNotifications(newNotifications);
        
        // Afficher des toasts pour les notifications non lues
        const criticalNotifications = newNotifications.filter(
          n => n.status === 'overdue' || (n.status === 'today' && n.priority === 'critical')
        );
        
        if (criticalNotifications.length > 0) {
          criticalNotifications.forEach(notification => {
            const message = notification.status === 'overdue'
              ? `Maintenance en retard: ${notification.title}`
              : `Maintenance critique aujourd'hui: ${notification.title}`;
              
            toast.warning(message, {
              description: `Équipement: ${notification.equipment}`,
              duration: 5000,
            });
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Charger les notifications au démarrage
    loadMaintenanceTasks();
    
    // Mettre en place un intervalle pour vérifier régulièrement les nouvelles notifications
    const intervalId = setInterval(loadMaintenanceTasks, 3600000); // Toutes les heures
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Marquer une notification comme lue
  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  // Obtenir la description de la notification
  const getNotificationDescription = (notification: MaintenanceNotification): string => {
    switch (notification.status) {
      case 'overdue':
        return `En retard depuis le ${format(notification.dueDate, 'd MMMM', { locale: fr })}`;
      case 'today':
        return 'Prévue aujourd\'hui';
      case 'upcoming':
        const daysUntil = Math.ceil((notification.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return `Prévue dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`;
    }
  };
  
  // Nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount,
    getNotificationDescription
  };
}
