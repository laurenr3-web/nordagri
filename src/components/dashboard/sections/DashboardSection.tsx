
import React from 'react';
import { DraggableDashboardSection } from '@/components/dashboard/DraggableDashboardSection';
import { Button } from '@/components/ui/button';

interface DashboardSectionProps {
  id: string;
  title: string;
  subtitle: string;
  isEditing: boolean;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  id, 
  title, 
  subtitle, 
  isEditing, 
  actionLabel, 
  onAction, 
  children 
}) => {
  return (
    <DraggableDashboardSection
      id={id}
      title={title}
      subtitle={subtitle}
      action={
        actionLabel && onAction ? (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : undefined
      }
      isDraggable={isEditing}
    >
      {children}
    </DraggableDashboardSection>
  );
};
