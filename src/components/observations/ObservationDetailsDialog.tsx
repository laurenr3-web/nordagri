
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Eye, 
  Check, 
  Calendar, 
  MapPin, 
  Trash2, 
  Pencil, 
  Wrench,
  Image
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FieldObservation, UrgencyLevel } from '@/types/FieldObservation';
import { Separator } from '@/components/ui/separator';

interface ObservationDetailsDialogProps {
  observation: FieldObservation | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const UrgencyBadge = ({ urgencyLevel }: { urgencyLevel: UrgencyLevel }) => {
  const getBadgeVariant = () => {
    switch (urgencyLevel) {
      case 'urgent':
        return 'destructive';
      case 'surveiller':
        return 'warning';
      case 'normal':
      default:
        return 'success';
    }
  };

  const getUrgencyIcon = () => {
    switch (urgencyLevel) {
      case 'urgent':
        return <AlertTriangle className="w-3 h-3 mr-1" />;
      case 'surveiller':
        return <Eye className="w-3 h-3 mr-1" />;
      case 'normal':
      default:
        return <Check className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <Badge variant={getBadgeVariant()} className="flex items-center">
      {getUrgencyIcon()}
      {urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}
    </Badge>
  );
};

const ObservationDetailsDialog: React.FC<ObservationDetailsDialogProps> = ({
  observation,
  isOpen,
  isLoading,
  onClose,
  onDelete,
  isDeleting
}) => {
  if (!observation && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : observation ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">
                  Observation #{observation.id}
                </DialogTitle>
                <UrgencyBadge urgencyLevel={observation.urgency_level} />
              </div>
              <p className="text-sm text-muted-foreground">
                {observation.observation_type.charAt(0).toUpperCase() + observation.observation_type.slice(1)}
              </p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date et heure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {format(new Date(observation.created_at), 'PPP à HH:mm', { locale: fr })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    Équipement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {observation.equipment || 'Non spécifié'}
                </CardContent>
              </Card>

              {observation.location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Emplacement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {observation.location}
                  </CardContent>
                </Card>
              )}
            </div>

            {observation.description && (
              <Card className="my-4">
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{observation.description}</p>
                </CardContent>
              </Card>
            )}

            {observation.photos && observation.photos.length > 0 && (
              <Card className="my-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Photos ({observation.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {observation.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/field-observations/${photo}`}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="gap-1"
                onClick={onClose}
              >
                Fermer
              </Button>
              <Button
                variant="outline"
                className="gap-1"
                disabled={isDeleting}
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                className="gap-1"
                onClick={() => observation.id && onDelete(observation.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center p-4">Impossible de charger les détails de l'observation</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ObservationDetailsDialog;
