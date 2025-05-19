
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Calendar } from 'lucide-react';

interface StatusBadgeProps {
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'scheduled':
      return (
        <Badge variant="secondary" className="flex gap-1 items-center">
          <Calendar size={12} />
          <span>Planifiée</span>
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge variant="warning" className="flex gap-1 items-center">
          <Clock size={12} />
          <span>En cours</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="success" className="flex gap-1 items-center">
          <CheckCircle size={12} />
          <span>Terminée</span>
        </Badge>
      );
    case 'canceled':
      return (
        <Badge variant="destructive" className="flex gap-1 items-center">
          <span>Annulée</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default StatusBadge;
