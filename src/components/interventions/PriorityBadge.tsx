
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPriorityBadgeClass } from './utils/interventionUtils';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <Badge className={getPriorityBadgeClass(priority)}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export default PriorityBadge;
