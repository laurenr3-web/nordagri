
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import CustomMaintenanceItem from './CustomMaintenanceItem';
import { CustomMaintenanceItem as CustomItem } from './types';

interface CustomTabProps {
  customItems: CustomItem[];
  addCustomItem: () => void;
  removeCustomItem: (index: number) => void;
  updateCustomItem: (index: number, field: keyof CustomItem, value: any) => void;
  toggleAllCustomItems: (selected: boolean) => void;
}

const CustomTab: React.FC<CustomTabProps> = ({
  customItems,
  addCustomItem,
  removeCustomItem,
  updateCustomItem,
  toggleAllCustomItems
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          {customItems.filter(i => i.selected && i.name).length} entretiens personnalisés
        </div>
        {customItems.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleAllCustomItems(true)}
            >
              <Check className="h-4 w-4 mr-1" /> Tout sélectionner
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleAllCustomItems(false)}
            >
              Tout désélectionner
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {customItems.map((item, index) => (
            <CustomMaintenanceItem
              key={index}
              item={item}
              index={index}
              updateCustomItem={updateCustomItem}
              removeCustomItem={removeCustomItem}
            />
          ))}
          
          <Button onClick={addCustomItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un entretien personnalisé
          </Button>
        </div>
      </ScrollArea>

      {customItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucun entretien personnalisé ajouté</p>
          <p className="text-sm">Cliquez sur le bouton ci-dessous pour ajouter un entretien</p>
          <Button onClick={addCustomItem} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un entretien personnalisé
          </Button>
        </div>
      )}
    </>
  );
};

export default CustomTab;
