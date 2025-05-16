
import React from 'react';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { cn } from '@/lib/utils';

interface NetworkStatusProps {
  className?: string;
  showLabel?: boolean;
  showButton?: boolean;
  variant?: 'default' | 'minimal';
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  className,
  showLabel = true,
  showButton = false,
  variant = 'default'
}) => {
  return (
    <SyncIndicator
      className={cn("inline-flex items-center", className)}
      showLabel={showLabel}
      showButton={showButton}
      variant={variant}
    />
  );
};

export default NetworkStatus;
