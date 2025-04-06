
import React, { useState } from 'react';
import { DashboardSection as DSectionProps } from '@/components/dashboard/DashboardSection';
import { Card } from '@/components/ui/card';
import { GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DraggableDashboardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  isDraggable: boolean;
  onResizeEnd?: (size: number) => void;
  className?: string;
  allowMinimize?: boolean;
}

export function DraggableDashboardSection({
  id,
  title,
  subtitle,
  children,
  action,
  isDraggable,
  onResizeEnd,
  className,
  allowMinimize = true,
  ...props
}: DraggableDashboardSectionProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

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
      
      {allowMinimize && (
        <div className="absolute top-3 right-3 z-10">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleMinimize}>
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      
      <DSectionProps
        title={title}
        subtitle={subtitle}
        action={action}
        className={isDraggable ? "pl-10 pr-10" : ""}
      >
        <div className={cn(
          "transition-all duration-300", 
          isMinimized ? "h-0 overflow-hidden opacity-0" : "opacity-100"
        )}>
          {children}
        </div>
      </DSectionProps>
    </Card>
  );
}
