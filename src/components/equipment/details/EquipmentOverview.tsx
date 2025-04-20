
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, getStatusColor, getStatusText } from '../utils/statusUtils';
import { EquipmentWearDisplay } from '../wear/EquipmentWearDisplay';

interface EquipmentDetailsProps {
  equipment: any;
}

export function EquipmentOverview({ equipment }: { equipment: any }) {
  // Helper function to check if data exists and is not empty
  const hasData = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };

  // Format engine hours display
  const formatEngineHours = () => {
    const hours = equipment.valeur_actuelle || equipment.current_hours;
    if (!hasData(hours)) return "Non renseigné";
    return `${hours} ${equipment.unite_d_usure === 'kilometres' ? 'km' : 'h'}`;
  };

  return (
    <div className="space-y-4">
      {/* Engine Hours Card */}
      <Card className="overflow-hidden border bg-muted/50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">⏱ Heures moteur</h3>
            <p className="text-2xl font-semibold">{formatEngineHours()}</p>
          </div>
        </CardContent>
      </Card>

      {/* General Information Card */}
      <Card className="overflow-hidden border-2 border-primary/10">
        <CardHeader className="bg-primary/10">
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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

      {/* Add the EquipmentWearDisplay component */}
      {hasData(equipment.unite_d_usure) && (
        <EquipmentWearDisplay equipment={equipment} />
      )}
      
      {/* Notes Card */}
      {hasData(equipment.notes) && (
        <Card className="overflow-hidden border-2 border-muted/20">
          <CardHeader className="bg-muted/10">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none mt-4">
              <p className="whitespace-pre-wrap">{equipment.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
