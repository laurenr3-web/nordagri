
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPriorityBadgeClass } from './utils/interventionUtils';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string; // Added className property
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  return (
    <Badge className={`${getPriorityBadgeClass(priority)} ${className || ''}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export default PriorityBadge;
