
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

interface EquipmentDetailsProps {
  equipment: any;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment }) => {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2 border-primary/10">
        <CardHeader className="bg-primary/10">
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Détails de base de l'équipement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Nom</h4>
              <p className="text-lg font-medium">{equipment.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Statut</h4>
              <Badge className={getStatusColor(equipment.status)} variant="secondary">
                {getStatusText(equipment.status)}
              </Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
              <p>{equipment.type || 'Non spécifié'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Catégorie</h4>
              <p>{equipment.category || 'Non spécifié'}</p>
            </div>
            
            <Separator className="md:col-span-2 my-2" />
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Fabricant</h4>
              <p>{equipment.manufacturer || 'Non spécifié'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Modèle</h4>
              <p>{equipment.model || 'Non spécifié'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Année</h4>
              <p>{equipment.year || 'Non spécifié'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Numéro de série</h4>
              <p>{equipment.serialNumber || 'Non spécifié'}</p>
            </div>
            
            <Separator className="md:col-span-2 my-2" />
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Emplacement</h4>
              <p>{equipment.location || 'Non spécifié'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Date d'achat</h4>
              <p>{equipment.purchaseDate ? formatDate(equipment.purchaseDate) : 'Non spécifié'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {equipment.notes && (
        <Card className="overflow-hidden border-2 border-muted/20">
          <CardHeader className="bg-muted/10">
            <CardTitle>Notes</CardTitle>
            <CardDescription>Informations supplémentaires sur cet équipement</CardDescription>
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
};

export default EquipmentDetails;
