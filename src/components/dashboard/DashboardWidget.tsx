
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
        "relative group animate-fade-in",
        isDragging && "opacity-50 z-50 rotate-2 scale-105"
      )}
      {...attributes}
    >
      <Card className={cn(
        "h-full transition-all duration-300 border-0 shadow-md hover:shadow-xl",
        "bg-gradient-to-br from-white via-white to-agri-25",
        "border border-agri-100/50",
        isCustomizing && "ring-2 ring-agri-300 ring-offset-2 shadow-lg scale-[1.02]"
      )}>
        <CardHeader className="pb-4 bg-gradient-to-r from-agri-50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCustomizing && (
                <button
                  {...listeners}
                  className="p-2 hover:bg-agri-100 rounded-lg cursor-move transition-colors duration-200 group-hover:bg-agri-50"
                >
                  <GripVertical className="h-4 w-4 text-agri-500" />
                </button>
              )}
              <div>
                <CardTitle className="text-lg font-semibold text-agri-900 tracking-tight">
                  {title}
                </CardTitle>
                <div className="h-1 w-12 bg-gradient-to-r from-agri-400 to-agri-600 rounded-full mt-1"></div>
              </div>
            </div>
            
            {isCustomizing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-agri-100 transition-colors duration-200"
                  >
                    <MoreVertical className="h-4 w-4 text-agri-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-agri-200 shadow-lg">
                  {onResize && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onResize('small')}
                        className="hover:bg-agri-50 focus:bg-agri-50"
                      >
                        <Minimize2 className="h-4 w-4 mr-2 text-agri-600" />
                        Petit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onResize('medium')}
                        className="hover:bg-agri-50 focus:bg-agri-50"
                      >
                        <Maximize2 className="h-4 w-4 mr-2 text-agri-600" />
                        Moyen
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onResize('large')}
                        className="hover:bg-agri-50 focus:bg-agri-50"
                      >
                        <Maximize2 className="h-4 w-4 mr-2 text-agri-600" />
                        Grand
                      </DropdownMenuItem>
                    </>
                  )}
                  {onRemove && (
                    <DropdownMenuItem 
                      onClick={onRemove} 
                      className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Retirer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="relative">
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
