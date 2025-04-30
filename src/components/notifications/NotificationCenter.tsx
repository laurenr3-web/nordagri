
import React, { useState } from 'react';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { formatNotificationDate } from '@/utils/dateUtils';
import { NotificationItem } from './NotificationItem';
import { EmptyState } from './EmptyState';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications
  } = useNotifications();

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteAll = () => {
    deleteAllNotifications();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <div className="font-medium">Notifications</div>
          <div className="flex space-x-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                title="Marquer tout comme lu"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive"
                title="Supprimer toutes les notifications"
                onClick={handleDeleteAll}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="h-[min(80vh,400px)]">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="flex justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
