
import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/hooks/useNotifications';
import { formatNotificationDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const isRead = notification.read_at !== null;
  
  // Déterminer l'icône et la couleur en fonction du type de notification
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'invite':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'alert':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'info':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div 
      className={cn(
        "p-4 border-b last:border-b-0 flex flex-col gap-2",
        !isRead && "bg-muted/20"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className={cn("text-sm font-medium", !isRead && "font-semibold")}>
              {notification.title}
            </h4>
            {!isRead && (
              <span className="rounded-full h-2 w-2 bg-blue-500"></span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.content}
          </p>
        </div>
        {/* Type badge */}
        {notification.type && (
          <span className={cn("text-xs px-2 py-1 rounded-full whitespace-nowrap", getTypeStyles())}>
            {notification.type}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-muted-foreground">
          {formatNotificationDate(notification.created_at)}
        </span>
        
        <div className="flex items-center gap-1">
          {!isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onMarkAsRead(notification.id)}
              title="Marquer comme lu"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => onDelete(notification.id)}
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
