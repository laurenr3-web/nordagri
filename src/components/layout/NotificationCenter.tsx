
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const NotificationCenter: React.FC = () => {
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  // Ici on pourrait connecter à un vrai service de notifications
  React.useEffect(() => {
    // Simulation de notifications non lues
    setUnreadCount(2);
  }, []);

  return (
    <TooltipProvider>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-1">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-72 p-0" align="end">
          <div className="p-4 border-b">
            <div className="font-medium">Notifications</div>
          </div>
          <div className="max-h-80 overflow-auto">
            <div className="py-2">
              <div className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors">
                <div className="text-sm font-medium">Maintenance planifiée</div>
                <div className="text-xs text-muted-foreground">Tracteur John Deere - Demain</div>
              </div>
              <div className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors">
                <div className="text-sm font-medium">Stock faible</div>
                <div className="text-xs text-muted-foreground">Filtres à huile - 2 restants</div>
              </div>
            </div>
          </div>
          {unreadCount === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          )}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
