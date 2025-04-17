
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, getStatusColor, getStatusText } from '../utils/statusUtils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EquipmentDetailsProps {
  equipment: any;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Helper function to check if data exists and is not empty
  const hasData = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-2 border-primary/10">
        <CardHeader className={`bg-primary/10 ${isMobile ? 'px-4 py-3' : ''}`}>
          <CardTitle className={isMobile ? "text-xl" : ""}>Informations générales</CardTitle>
          <CardDescription>Détails de base de l'équipement</CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "p-4" : "pt-4 p-6"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Always show name as it's required */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Nom</h4>
              <p className="text-lg font-medium">{equipment.name}</p>
            </div>
            
            {/* Only show status if it exists */}
            {hasData(equipment.status) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Statut</h4>
                <Badge className={getStatusColor(equipment.status)} variant="secondary">
                  {getStatusText(equipment.status)}
                </Badge>
              </div>
            )}
            
            {/* Only show type if it exists */}
            {hasData(equipment.type) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                <p>{equipment.type}</p>
              </div>
            )}
            
            {/* Only show category if it exists */}
            {hasData(equipment.category) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Catégorie</h4>
                <p>{equipment.category}</p>
              </div>
            )}
            
            {/* Only add separator if we have additional information */}
            {(hasData(equipment.manufacturer) || hasData(equipment.model) || 
              hasData(equipment.year) || hasData(equipment.serialNumber)) && (
              <Separator className="md:col-span-2 my-2" />
            )}
            
            {/* Only show manufacturer if it exists */}
            {hasData(equipment.manufacturer) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Fabricant</h4>
                <p>{equipment.manufacturer}</p>
              </div>
            )}
            
            {/* Only show model if it exists */}
            {hasData(equipment.model) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Modèle</h4>
                <p>{equipment.model}</p>
              </div>
            )}
            
            {/* Only show year if it exists */}
            {hasData(equipment.year) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Année</h4>
                <p>{equipment.year}</p>
              </div>
            )}
            
            {/* Only show serial number if it exists */}
            {hasData(equipment.serialNumber) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Numéro de série</h4>
                <p>{equipment.serialNumber}</p>
              </div>
            )}
            
            {/* Only add separator if we have location or purchase date */}
            {(hasData(equipment.location) || hasData(equipment.purchaseDate)) && (
              <Separator className="md:col-span-2 my-2" />
            )}
            
            {/* Only show location if it exists */}
            {hasData(equipment.location) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Emplacement</h4>
                <p>{equipment.location}</p>
              </div>
            )}
            
            {/* Only show purchase date if it exists */}
            {hasData(equipment.purchaseDate) && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Date d'achat</h4>
                <p>{formatDate(equipment.purchaseDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Only show notes card if notes exist */}
      {hasData(equipment.notes) && (
        <Card className="overflow-hidden border-2 border-muted/20">
          <CardHeader className={`bg-muted/10 ${isMobile ? 'px-4 py-3' : ''}`}>
            <CardTitle className={isMobile ? "text-xl" : ""}>Notes</CardTitle>
            <CardDescription>Informations supplémentaires sur cet équipement</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "p-4" : ""}>
            <div className="prose prose-sm max-w-none mt-2">
              <p className="whitespace-pre-wrap">{equipment.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentDetails;
