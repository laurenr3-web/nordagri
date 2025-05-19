
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, X, CalendarCheck } from 'lucide-react';
import { getStatusBadgeClass } from './utils/interventionUtils';

interface StatusBadgeProps {
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Determine icon based on status
  const getIcon = () => {
    switch (status) {
      case 'scheduled':
        return <CalendarCheck size={12} />;
      case 'in-progress':
        return <Clock size={12} />;
      case 'completed':
        return <CheckCircle2 size={12} />;
      case 'canceled':
        return <X size={12} />;
      default:
        return null;
    }
  };
  
  // Get label based on status
  const getLabel = () => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };
  
  return (
    <Badge 
      variant={status === 'scheduled' || status === 'canceled' ? 'outline' : 'default'} 
      className={getStatusBadgeClass(status)}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

export default StatusBadge;
