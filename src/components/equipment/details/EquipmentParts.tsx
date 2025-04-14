
import React from 'react';
import { useEquipmentParts } from '@/hooks/parts/useEquipmentParts';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Bug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EquipmentPartsProps {
  equipment: EquipmentItem;
}

const EquipmentParts: React.FC<EquipmentPartsProps> = ({ equipment }) => {
  const navigate = useNavigate();
  const { 
    parts, 
    loading, 
    error,
    isUsingDemoData,
    debugPartData 
  } = useEquipmentParts(equipment.id);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pièces détachées</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={debugPartData}
          >
            <Bug className="h-4 w-4 mr-1" />
            <span>Déboguer</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/parts')}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Gérer</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isUsingDemoData && (
          <Alert variant="warning" className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Données de démonstration</AlertTitle>
            <AlertDescription>
              Vous visualisez actuellement des données de démonstration, pas des données réelles de la base de données.
            </AlertDescription>
          </Alert>
        )}
        
        {loading && (
          <LoadingSpinner message="Chargement des pièces..." size="md" />
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {!loading && !error && (!parts || parts.length === 0) && (
          <p className="text-muted-foreground">
            Aucune pièce détachée n'est associée à cet équipement pour le moment.
          </p>
        )}
        
        {!loading && !error && parts && parts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {parts.length} pièce(s) compatible(s)
              </Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parts.map((part) => (
                <Card key={part.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {part.image ? (
                      <img 
                        src={part.image} 
                        alt={part.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                        Pas d'image
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{part.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Référence: {part.partNumber}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-medium">{part.price} €</p>
                      <Badge variant={part.stock > 0 ? "default" : "destructive"}>
                        {part.stock > 0 ? `En stock: ${part.stock}` : "Rupture"}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => navigate(`/parts/${part.id}`)}
                    >
                      Voir détails
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
