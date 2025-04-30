
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  read_at: string | null;
  metadata: Record<string, any> | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications table updates
  const { isSubscribed } = useRealtimeSubscription<Notification>({
    tableName: 'notifications',
    eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
    onInsert: (payload) => {
      // Type guard to ensure payload.new is a Notification
      if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
      }
    },
    onUpdate: (payload) => {
      // Type guard for payload.new and payload.old
      if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
        const updatedNotification = payload.new as Notification;
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === updatedNotification.id ? updatedNotification : notification
          )
        );
        // Update unread count if notification was marked as read
        if (payload.old && typeof payload.old === 'object' && 'read_at' in payload.old && 
            payload.old.read_at === null && updatedNotification.read_at !== null) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
      }
    },
    onDelete: (payload) => {
      // Type guard for payload.old
      if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
        const deletedNotification = payload.old as Notification;
        setNotifications(prev => 
          prev.filter(notification => notification.id !== deletedNotification.id)
        );
        // Update unread count if an unread notification was deleted
        if (deletedNotification.read_at === null) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
      }
    },
    showNotifications: false,
  });

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(notification => notification.read_at === null).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      toast.error('Impossible de marquer la notification comme lue');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Impossible de marquer toutes les notifications comme lues');
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // Update unread count if an unread notification was deleted
      if (deletedNotification && deletedNotification.read_at === null) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      toast.success('Notification supprimée');
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      toast.error('Impossible de supprimer la notification');
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all
      
      if (error) throw error;
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      toast.success('Toutes les notifications ont été supprimées');
    } catch (err: any) {
      console.error('Error deleting all notifications:', err);
      toast.error('Impossible de supprimer toutes les notifications');
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    isSubscribed,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh: fetchNotifications
  };
}
