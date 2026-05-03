import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Leaf } from 'lucide-react';

interface Props {
  firstName?: string | null;
  farmName?: string | null;
  avatarUrl?: string | null;
}

export const DashboardHeader: React.FC<Props> = ({ firstName, farmName, avatarUrl }) => {
  const today = format(new Date(), 'EEEE d MMMM', { locale: fr });
  const initials = (firstName || '?').slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
              {farmName || `Bonjour ${firstName || ''}`}
            </h1>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
          <p className="text-[11px] text-muted-foreground capitalize truncate">
            Synchronisé · {today}
          </p>
        </div>
      </div>
      <Avatar className="h-10 w-10 flex-shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName || ''} />}
        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
};
