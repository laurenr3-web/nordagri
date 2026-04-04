
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

// Map DB row to Notification interface
function mapDbToNotification(row: any): Notification {
  return {
    id: row.id,
    title: row.title,
    content: row.message || '',
    type: row.type,
    created_at: row.created_at,
    read_at: row.read ? row.created_at : null,
    metadata: row.data || null,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isSubscribed } = useRealtimeSubscription<Notification>({
    tableName: 'notifications',
    eventTypes: ['INSERT', 'UPDATE', 'DELETE'],
    onInsert: (payload) => {
      if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
        const newNotification = mapDbToNotification(payload.new);
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
      }
    },
    onUpdate: (payload) => {
      if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
        const updatedNotification = mapDbToNotification(payload.new);
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === updatedNotification.id ? updatedNotification : notification
          )
        );
      }
    },
    onDelete: (payload) => {
      if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
        const deletedNotification = payload.old as any;
        setNotifications(prev =>
          prev.filter(notification => notification.id !== deletedNotification.id)
        );
        if (!deletedNotification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
      }
    },
    showNotifications: false,
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mapped = (data || []).map(mapDbToNotification);
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => n.read_at === null).length);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

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

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

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

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));

      if (deletedNotification && deletedNotification.read_at === null) {
        setUnreadCount(count => Math.max(0, count - 1));
      }

      toast.success('Notification supprimée');
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      toast.error('Impossible de supprimer la notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);

      toast.success('Toutes les notifications ont été supprimées');
    } catch (err: any) {
      console.error('Error deleting all notifications:', err);
      toast.error('Impossible de supprimer toutes les notifications');
    }
  };

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
