
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentGridProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string | undefined) => string;
  getStatusText: (status: string | undefined) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map((item) => (
        <Card 
          key={item.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleEquipmentClick(item)}
        >
          <div className="aspect-video relative overflow-hidden">
            <img
              src={item.image || "https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop"}
              alt={item.name}
              className="object-cover w-full h-full transition-transform hover:scale-105"
            />
            <Badge 
              className={`absolute top-2 right-2 ${getStatusColor(item.status)}`}
              variant="secondary"
            >
              {getStatusText(item.status)}
            </Badge>
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              {item.year && (
                <Badge variant="outline">{item.year}</Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              {item.manufacturer && item.model ? (
                <p>{item.manufacturer} {item.model}</p>
              ) : (
                <p>{item.manufacturer || item.model || item.type || 'Équipement'}</p>
              )}
              {item.location && (
                <p className="mt-1">Emplacement: {item.location}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground pt-0">
            {item.serialNumber && <p>S/N: {item.serialNumber}</p>}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default EquipmentGrid;
