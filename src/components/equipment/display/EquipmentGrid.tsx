
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

// Image de placeholder sécurisée et locale
const PLACEHOLDER_IMAGE = "/placeholder.svg";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {equipment.map((item) => (
        <Card 
          key={item.id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleEquipmentClick(item)}
        >
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={item.image || PLACEHOLDER_IMAGE}
              alt={item.name}
              className="object-cover w-full h-full transition-transform hover:scale-105"
              onError={(e) => {
                // Fallback en cas d'erreur de chargement d'image
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
            <Badge 
              className={`absolute top-1 right-1 text-xs ${getStatusColor(item.status)}`}
              variant="secondary"
            >
              {getStatusText(item.status)}
            </Badge>
          </div>
          
          <CardHeader className="p-2 pb-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              {item.year && (
                <Badge variant="outline" className="text-xs">{item.year}</Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-2 pb-0">
            <div className="text-xs text-muted-foreground">
              {item.manufacturer && item.model ? (
                <p>{item.manufacturer} {item.model}</p>
              ) : (
                <p>{item.manufacturer || item.model || item.type || 'Équipement'}</p>
              )}
              {item.location && (
                <p className="truncate">{item.location}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground p-2">
            {item.serialNumber && <p className="truncate">S/N: {item.serialNumber}</p>}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default EquipmentGrid;
