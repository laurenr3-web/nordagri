
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Clock, CheckCircle2, X } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'scheduled':
      return (
        <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
          <CalendarCheck size={12} />
          <span>Planifiée</span>
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge className="bg-harvest-100 text-harvest-800 flex items-center gap-1">
          <Clock size={12} />
          <span>En cours</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Terminée</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
          <X size={12} />
          <span>Annulée</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-secondary text-muted-foreground flex items-center gap-1">
          <span>{status}</span>
        </Badge>
      );
  }
};

export default StatusBadge;
