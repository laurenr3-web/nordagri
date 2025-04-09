
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Equipment } from '@/hooks/equipment/useEquipmentTable';

interface EquipmentGridProps {
  equipment: Equipment[];
  isLoading: boolean;
  onDelete: (id: string | number) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipment, isLoading, onDelete }) => {
  // Helper function to determine status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get status text
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'operational':
        return 'Opérationnel';
      case 'maintenance':
        return 'En maintenance';
      case 'repair':
        return 'En réparation';
      default:
        return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium mb-2">Aucun équipement trouvé</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Aucun équipement ne correspond à vos critères de recherche ou votre parc d'équipements est vide.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {equipment.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="aspect-video relative">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'}
              alt={item.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop';
              }}
            />
            <Badge className={`absolute top-2 right-2 ${getStatusColor(item.status)}`}>
              {getStatusText(item.status)}
            </Badge>
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold truncate">{item.name}</h3>
              {item.year && <Badge variant="outline">{item.year}</Badge>}
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground">
              {item.manufacturer && item.model ? (
                <p>{item.manufacturer} {item.model}</p>
              ) : (
                <p>{item.manufacturer || item.model || '-'}</p>
              )}
              {item.location && <p className="truncate">{item.location}</p>}
              {item.serialNumber && (
                <p className="text-xs truncate mt-1">S/N: {item.serialNumber}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default EquipmentGrid;
