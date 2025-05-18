
import { useState, useEffect } from 'react';
import { MaintenanceTask } from './maintenanceSlice';
import { addDays, format, isWithinInterval, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTasksManager } from './useTasksManager';
import { toast } from "@/hooks/use-toast";

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
  
  // Get tasks from the task manager to ensure consistency
  const { tasks } = useTasksManager();
  
  // Create notifications based on tasks
  useEffect(() => {
    const createNotifications = () => {
      try {
        setLoading(true);
        
        // Filter tasks - we only want scheduled or in-progress tasks
        const relevantTasks = tasks.filter(task => 
          task.status === 'scheduled' || task.status === 'in-progress'
        );
        
        // Create notifications for upcoming, today, or overdue tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = addDays(today, 7);
        nextWeek.setHours(23, 59, 59, 999);
        
        const newNotifications: MaintenanceNotification[] = [];
        
        relevantTasks.forEach(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          
          let status: 'upcoming' | 'overdue' | 'today';
          
          if (isPast(taskDate) && !isToday(taskDate)) {
            status = 'overdue';
          } else if (isToday(taskDate)) {
            status = 'today';
          } else if (isWithinInterval(taskDate, { start: today, end: nextWeek })) {
            status = 'upcoming';
          } else {
            // Task not yet to notify
            return;
          }
          
          newNotifications.push({
            id: Date.now() + Math.floor(Math.random() * 1000) + task.id,
            taskId: task.id,
            title: task.title,
            equipment: task.equipment,
            dueDate: task.dueDate,
            status,
            priority: task.priority,
            read: false
          });
        });
        
        // Sort notifications (overdue, today, upcoming)
        newNotifications.sort((a, b) => {
          // First by status
          const statusOrder = { overdue: 0, today: 1, upcoming: 2 };
          const statusComparison = statusOrder[a.status] - statusOrder[b.status];
          if (statusComparison !== 0) return statusComparison;
          
          // Then by priority
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
          const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
          const priorityComparison = priorityA - priorityB;
          if (priorityComparison !== 0) return priorityComparison;
          
          // Finally by due date
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        
        setNotifications(newNotifications);
        
        // Show toasts for critical notifications
        const criticalNotifications = newNotifications.filter(
          n => n.status === 'overdue' || (n.status === 'today' && n.priority === 'critical')
        );
        
        if (criticalNotifications.length > 0) {
          criticalNotifications.forEach(notification => {
            const message = notification.status === 'overdue'
              ? `Maintenance en retard: ${notification.title}`
              : `Maintenance critique aujourd'hui: ${notification.title}`;
              
            // Using the shadcn toast instead of sonner
            toast({
              title: message,
              description: `Équipement: ${notification.equipment}`,
              // Short duration for toast (8 seconds instead of default)
              duration: 8000,
              variant: "destructive",
            });
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Create notifications when tasks change
    createNotifications();
    
  }, [tasks]);
  
  // Mark a notification as read
  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  // Get notification description
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
  
  // Count unread notifications
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
