
import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Grid3X3, Grid2X2, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DensityMode = 'comfortable' | 'compact' | 'dense';
export type ViewMode = 'grid' | 'list';

interface EquipmentDensityToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  density: DensityMode;
  onDensityChange: (density: DensityMode) => void;
  className?: string;
}

export const EquipmentDensityToggle: React.FC<EquipmentDensityToggleProps> = ({
  currentView,
  onViewChange,
  density,
  onDensityChange,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* View Toggle */}
      <ToggleGroup
        type="single"
        value={currentView}
        onValueChange={(value) => value && onViewChange(value as ViewMode)}
      >
        <ToggleGroupItem value="grid" aria-label="Vue grille">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="Vue liste">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Density Toggle */}
      <ToggleGroup
        type="single"
        value={density}
        onValueChange={(value) => value && onDensityChange(value as DensityMode)}
      >
        <ToggleGroupItem value="comfortable" aria-label="Confortable">
          <Grid2X2 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="compact" aria-label="Compact">
          <Grid3X3 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="dense" aria-label="Dense">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
            <div className="bg-current rounded-sm"></div>
          </div>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
