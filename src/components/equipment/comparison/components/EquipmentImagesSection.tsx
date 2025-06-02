
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

interface EquipmentImagesSectionProps {
  equipment: EquipmentItem[];
  onRemoveEquipment: (id: number) => void;
}

export const EquipmentImagesSection: React.FC<EquipmentImagesSectionProps> = ({
  equipment,
  onRemoveEquipment
}) => {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${equipment.length}, 1fr)` }}>
      {equipment.map((item) => (
        <Card key={item.id} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
            onClick={() => onRemoveEquipment(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="aspect-video overflow-hidden rounded-t-lg">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Aucune image</span>
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{item.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
