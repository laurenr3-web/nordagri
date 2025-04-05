
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

// Image par défaut locale au lieu d'utiliser une URL externe
const DEFAULT_EQUIPMENT_IMAGE = '/lovable-uploads/equipment-default.png';

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
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full"
          onClick={() => handleEquipmentClick(item)}
        >
          <div className="aspect-video relative overflow-hidden bg-gray-100">
            {/* Utilisation d'une image locale avec fallback et gestion des erreurs */}
            <img
              src={item.image || DEFAULT_EQUIPMENT_IMAGE}
              alt={`${item.name} - ${item.type || 'Équipement'}`}
              className="object-cover w-full h-full transition-transform hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_EQUIPMENT_IMAGE;
                e.currentTarget.onerror = null; // Éviter les boucles d'erreur
              }}
              loading="lazy" // Chargement lazy pour améliorer les performances
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
              <h3 className="font-semibold text-lg line-clamp-2">{item.name}</h3>
              {item.year && (
                <Badge variant="outline">{item.year}</Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              {item.manufacturer && item.model ? (
                <p className="truncate">{item.manufacturer} {item.model}</p>
              ) : (
                <p className="truncate">{item.manufacturer || item.model || item.type || 'Équipement'}</p>
              )}
              {item.location && (
                <p className="mt-1 truncate">Emplacement: {item.location}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground pt-0 mt-auto">
            {item.serialNumber && <p className="truncate">S/N: {item.serialNumber}</p>}
          </CardFooter>
        </Card>
      ))}
      
      {equipment.length === 0 && (
        <div className="col-span-full flex justify-center items-center p-8 text-muted-foreground">
          Aucun équipement ne correspond à vos critères.
        </div>
      )}
    </div>
  );
};

export default EquipmentGrid;
