
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, MoreVertical, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  children: React.ReactNode;
  onRemove?: () => void;
  onResize?: (size: 'small' | 'medium' | 'large' | 'full') => void;
  isCustomizing?: boolean;
}

export const DashboardWidget = ({
  id,
  title,
  size,
  children,
  onRemove,
  onResize,
  isCustomizing
}: DashboardWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isCustomizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
      {...attributes}
    >
      <Card className={cn(
        "h-full transition-all",
        isCustomizing && "ring-2 ring-primary/20 ring-offset-2"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCustomizing && (
                <button
                  {...listeners}
                  className="p-1 hover:bg-muted rounded cursor-move"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <CardTitle className="text-base font-medium">{title}</CardTitle>
            </div>
            
            {isCustomizing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onResize && (
                    <>
                      <DropdownMenuItem onClick={() => onResize('small')}>
                        <Minimize2 className="h-4 w-4 mr-2" />
                        Petit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResize('medium')}>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Moyen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResize('large')}>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Grand
                      </DropdownMenuItem>
                    </>
                  )}
                  {onRemove && (
                    <DropdownMenuItem onClick={onRemove} className="text-destructive">
                      <X className="h-4 w-4 mr-2" />
                      Retirer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
