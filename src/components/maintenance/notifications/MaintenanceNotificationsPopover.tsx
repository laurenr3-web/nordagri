
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BlurContainer } from '@/components/ui/blur-container';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMaintenanceNotifications } from '@/hooks/maintenance/useMaintenanceNotifications';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const MaintenanceNotificationsPopover: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    getNotificationDescription 
  } = useMaintenanceNotifications();
  const isMobile = useIsMobile();
  
  const handleNotificationClick = (taskId: number) => {
    // If already on maintenance page, update search params to highlight the task
    if (location.pathname === '/maintenance') {
      setSearchParams({ highlight: taskId.toString() });
    } else {
      // Otherwise navigate to maintenance page with highlight parameter
      navigate(`/maintenance?highlight=${taskId}`);
    }
    
    setOpen(false);
  };

  const notificationsList = (
    <div className="space-y-1 p-2">
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          <p>Aucune notification</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <BlurContainer
            key={notification.id}
            className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
              !notification.read ? 'border-l-2 border-primary' : ''
            }`}
            onClick={() => {
              markAsRead(notification.id);
              handleNotificationClick(notification.taskId);
            }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{notification.title}</span>
              <Badge 
                variant={
                  notification.status === 'overdue' ? 'destructive' : 
                  notification.status === 'today' ? 'default' : 'outline'
                }
                className="text-xs"
              >
                {notification.status === 'overdue' ? 'En retard' : 
                 notification.status === 'today' ? 'Aujourd\'hui' : 'À venir'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {notification.equipment}
            </p>
            <div className="flex justify-between items-center text-xs">
              <span>{getNotificationDescription(notification)}</span>
              <span className="text-muted-foreground">
                {format(notification.dueDate, 'dd/MM/yyyy', { locale: fr })}
              </span>
            </div>
          </BlurContainer>
        ))
      )}
    </div>
  );

  // Version mobile avec Sheet au lieu de Popover
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-10rem)]">
            {notificationsList}
          </ScrollArea>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                navigate('/maintenance');
                setOpen(false);
              }}
            >
              Voir toutes les tâches
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  // Version desktop avec Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
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
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 py-1 text-xs"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        <Separator />
        
        <ScrollArea className="h-80">
          {notificationsList}
        </ScrollArea>
        
        <Separator />
        
        <div className="p-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => {
              navigate('/maintenance');
              setOpen(false);
            }}
          >
            Voir toutes les tâches
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MaintenanceNotificationsPopover;
