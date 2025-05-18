
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'high':
      return (
        <Badge variant="destructive" className="flex gap-1 items-center">
          <AlertOctagon size={12} />
          <span>Haute</span>
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="warning" className="flex gap-1 items-center">
          <AlertTriangle size={12} />
          <span>Moyenne</span>
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="secondary" className="flex gap-1 items-center">
          <AlertCircle size={12} />
          <span>Basse</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

export default PriorityBadge;
