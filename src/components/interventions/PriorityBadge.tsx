
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string; // Added className prop
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  switch (priority) {
    case 'high':
      return (
        <Badge variant="destructive" className={`flex gap-1 items-center ${className || ''}`}>
          <AlertOctagon size={12} />
          <span>Haute</span>
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="warning" className={`flex gap-1 items-center ${className || ''}`}>
          <AlertTriangle size={12} />
          <span>Moyenne</span>
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="secondary" className={`flex gap-1 items-center ${className || ''}`}>
          <AlertCircle size={12} />
          <span>Basse</span>
        </Badge>
      );
    default:
      return <Badge variant="secondary" className={className}>{priority}</Badge>;
  }
};

export default PriorityBadge;
