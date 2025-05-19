
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPriorityBadgeClass } from './utils/interventionUtils';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string; // Added className property
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  // Get the capitalized label safely, ensuring priority is defined
  const getCapitalizedLabel = () => {
    if (!priority) return 'Unknown';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <Badge className={`${getPriorityBadgeClass(priority)} ${className || ''}`}>
      {getCapitalizedLabel()}
    </Badge>
  );
};

export default PriorityBadge;
