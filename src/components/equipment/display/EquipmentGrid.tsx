
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EquipmentGridProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({ 
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick
}) => {
  // Safe click handler to prevent the "removeChild" error
  const handleClick = (item: EquipmentItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use setTimeout to ensure this happens outside the current event loop
    // This helps prevent React DOM manipulation conflicts
    setTimeout(() => {
      handleEquipmentClick(item);
    }, 0);
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
        {equipment.map((item) => (
          <Card 
            key={`equipment-${item.id}`}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleClick(item)}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=300'}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-muted-foreground text-sm truncate">{item.type}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(EquipmentGrid);
