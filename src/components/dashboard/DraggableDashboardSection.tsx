
import React from 'react';
import { useMotionValue, Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { widgetStyles, transitions, backgrounds } from '@/lib/design-system';
import { GripVertical } from 'lucide-react';

export interface DraggableDashboardSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isDraggable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function DraggableDashboardSection({
  id,
  title,
  subtitle,
  action,
  isDraggable = false,
  className,
  children
}: DraggableDashboardSectionProps) {
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  
  return (
    <Reorder.Item
      value={id}
      id={id}
      style={{ y }}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        widgetStyles.container,
        transitions.default,
        "hover:shadow-lg",
        className
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div
              className="cursor-grab active:cursor-grabbing p-1"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-medium">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className={cn("p-4", isDraggable && backgrounds.subtle)}>
        {children}
      </div>
    </Reorder.Item>
  );
}
