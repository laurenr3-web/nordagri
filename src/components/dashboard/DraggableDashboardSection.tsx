
import React, { useState } from 'react';
import { DashboardSection as DSectionProps } from '@/components/dashboard/DashboardSection';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableDashboardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  isDraggable: boolean;
  onResizeEnd?: (size: number) => void;
  className?: string;
}

export function DraggableDashboardSection({
  id,
  title,
  subtitle,
  children,
  action,
  isDraggable,
  className,
  ...props
}: DraggableDashboardSectionProps) {
  return (
    <Card
      className={cn(
        "mb-8 relative transition-all duration-200",
        isDraggable && "cursor-move border-dashed ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
      data-section-id={id}
    >
      {isDraggable && (
        <div className="absolute top-3 left-3 p-1.5 rounded-md bg-muted/80 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <DSectionProps
        title={title}
        subtitle={subtitle}
        action={action}
        className={isDraggable ? "pl-10" : ""}
      >
        {children}
      </DSectionProps>
    </Card>
  );
}
