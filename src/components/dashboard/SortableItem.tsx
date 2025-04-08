
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from '@/components/ui/resizable';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onResizeEnd?: (size: number) => void;
}

export function SortableItem({ id, children, onResizeEnd }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    width: '100%',
    height: '100%',
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`${isDragging ? 'opacity-50' : ''} w-full`}
    >
      {children}
    </div>
  );
}

export function ResizableSortableItem({ id, children, onResizeEnd }: SortableItemProps) {
  return (
    <SortableItem id={id} onResizeEnd={onResizeEnd}>
      <ResizablePanelGroup 
        direction="vertical"
        onLayout={(sizes) => onResizeEnd?.(sizes[0])}
        className="min-h-[200px]"
      >
        <ResizablePanel defaultSize={100}>
          {children}
        </ResizablePanel>
        <ResizableHandle withHandle />
      </ResizablePanelGroup>
    </SortableItem>
  );
}
