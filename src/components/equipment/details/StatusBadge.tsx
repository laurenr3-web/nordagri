
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'status-operational';
    case 'maintenance':
      return 'status-maintenance';
    case 'repair':
      return 'status-repair';
    default:
      return 'bg-secondary text-muted-foreground';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'maintenance':
      return 'In Maintenance';
    case 'repair':
      return 'Needs Repair';
    default:
      return status;
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
