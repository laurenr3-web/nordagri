
import React, { useState } from 'react';
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
import { Timer } from 'lucide-react';

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

  // Format engine hours
  const formatEngineHours = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return 'Non renseigné';
    return `${hours} h`;
  };

  // Get engine hours from either engine_hours or current_hours or valeur_actuelle
  const engineHours = equipment.engine_hours ?? equipment.current_hours ?? equipment.valeur_actuelle;

  return (
    <div className="space-y-4">
      {isMobile && (
        <Card className="overflow-hidden border-2 border-muted/20 rounded-xl">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-2 py-2">
              <Timer className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Heures moteur</h3>
              <p className="text-lg font-semibold">{formatEngineHours(engineHours)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-2 border-primary/10 rounded-xl">
        <CardHeader className={`bg-primary/10 ${isMobile ? 'px-4 py-3' : ''}`}>
          <CardTitle className={isMobile ? "text-xl" : ""}>Informations générales</CardTitle>
          <CardDescription>Détails de base de l'équipement</CardDescription>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-4 space-y-3' : 'pt-4 p-6'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Always show name as it's required */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Nom</h4>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>{equipment.name}</p>
            </div>
            
            {/* Only show type if it exists */}
            {hasData(equipment.type) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.type}</p>
              </div>
            )}
            
            {/* Only show category if it exists */}
            {hasData(equipment.category) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Catégorie</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.category}</p>
              </div>
            )}
            
            {/* Status moved here for mobile */}
            {hasData(equipment.status) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Statut</h4>
                <Badge className={getStatusColor(equipment.status)} variant="secondary">
                  {getStatusText(equipment.status)}
                </Badge>
              </div>
            )}
            
            {/* Mobile: Show engine hours */}
            {isMobile && engineHours !== undefined && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Heures moteur</h4>
                <p className={isMobile ? 'text-lg font-semibold' : ''}>{formatEngineHours(engineHours)}</p>
              </div>
            )}
            
            {/* Only add separator if we have additional information */}
            {(hasData(equipment.manufacturer) || hasData(equipment.model) || 
              hasData(equipment.year) || hasData(equipment.serialNumber)) && (
              <Separator className="md:col-span-2 my-2" />
            )}
            
            {/* Only show manufacturer if it exists */}
            {hasData(equipment.manufacturer) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Fabricant</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.manufacturer}</p>
              </div>
            )}
            
            {/* Only show model if it exists */}
            {hasData(equipment.model) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Modèle</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.model}</p>
              </div>
            )}
            
            {/* Only show year if it exists */}
            {hasData(equipment.year) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Année</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.year}</p>
              </div>
            )}
            
            {/* Only show serial number if it exists */}
            {hasData(equipment.serialNumber) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Numéro de série</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.serialNumber}</p>
              </div>
            )}
            
            {/* Only add separator if we have location or purchase date */}
            {(hasData(equipment.location) || hasData(equipment.purchaseDate)) && (
              <Separator className="md:col-span-2 my-2" />
            )}
            
            {/* Only show location if it exists */}
            {hasData(equipment.location) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Emplacement</h4>
                <p className={isMobile ? 'text-sm' : ''}>{equipment.location}</p>
              </div>
            )}
            
            {/* Only show purchase date if it exists */}
            {hasData(equipment.purchaseDate) && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Date d'achat</h4>
                <p className={isMobile ? 'text-sm' : ''}>{formatDate(equipment.purchaseDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Only show notes card if notes exist */}
      {hasData(equipment.notes) && (
        <Card className="overflow-hidden border-2 border-muted/20 rounded-xl">
          <CardHeader className={`bg-muted/10 ${isMobile ? 'px-4 py-3' : ''}`}>
            <CardTitle className={isMobile ? "text-xl" : ""}>Notes</CardTitle>
            <CardDescription>Informations supplémentaires sur cet équipement</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "p-4" : ""}>
            <div className="prose prose-sm max-w-none mt-2">
              <p className="whitespace-pre-wrap text-sm">{equipment.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentDetails;
