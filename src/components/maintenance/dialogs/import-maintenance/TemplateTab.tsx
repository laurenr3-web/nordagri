
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import MaintenanceItem from './MaintenanceItem';
import { MaintenanceTemplateItem } from '@/constants/maintenanceTemplates';

interface TemplateTabProps {
  maintenanceItems: (MaintenanceTemplateItem & { selected: boolean })[];
  toggleMaintenanceItem: (id: string) => void;
  toggleAllMaintenanceItems: (selected: boolean) => void;
  updateMaintenanceItemInterval: (id: string, interval: number) => void;
}

const TemplateTab: React.FC<TemplateTabProps> = ({
  maintenanceItems,
  toggleMaintenanceItem,
  toggleAllMaintenanceItems,
  updateMaintenanceItemInterval
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          {maintenanceItems.filter(i => i.selected).length} entretiens sélectionnés sur {maintenanceItems.length}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleAllMaintenanceItems(true)}
          >
            <Check className="h-4 w-4 mr-1" /> Tout sélectionner
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleAllMaintenanceItems(false)}
          >
            Tout désélectionner
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {maintenanceItems.map((item) => (
            <MaintenanceItem
              key={item.id}
              item={item}
              toggleMaintenanceItem={toggleMaintenanceItem}
              updateMaintenanceItemInterval={updateMaintenanceItemInterval}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

export default TemplateTab;
