
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Tag,
  Clock,
  Tractor,
} from 'lucide-react';
import { FieldObservation } from '@/types/FieldObservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ObservationDetailsDialogProps {
  observation: FieldObservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ObservationDetailsDialog: React.FC<ObservationDetailsDialogProps> = ({
  observation,
  open,
  onOpenChange,
}) => {
  if (!observation) {
    return null;
  }

  const formattedDate = observation.date
    ? format(new Date(observation.date), 'PPP à HH:mm', { locale: fr })
    : '';

  // Déterminer la couleur du badge d'urgence
  const getUrgencyBadge = () => {
    switch (observation.urgency_level) {
      case 'urgent':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Urgent</span>
          </Badge>
        );
      case 'surveiller':
        return (
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>À surveiller</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Normal</span>
          </Badge>
        );
    }
  };

  // Déterminer la couleur du badge de type d'observation
  const getTypeBadge = () => {
    switch (observation.observation_type) {
      case 'panne':
        return <Badge className="bg-red-100 text-red-800">Panne</Badge>;
      case 'usure':
        return <Badge className="bg-blue-100 text-blue-800">Usure</Badge>;
      case 'anomalie':
        return (
          <Badge className="bg-purple-100 text-purple-800">Anomalie</Badge>
        );
      case 'entretien':
        return (
          <Badge className="bg-green-100 text-green-800">Entretien</Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">Autre</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Détails de l'observation
            {getUrgencyBadge()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Tractor className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Équipement</p>
                <p className="font-medium">{observation.equipment}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <div>{getTypeBadge()}</div>
              </div>
            </div>

            {observation.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Localisation</p>
                  <p>{observation.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p>{formattedDate}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm whitespace-pre-wrap">
                {observation.description || "Aucune description fournie."}
              </p>
            </div>
          </div>

          {observation.photos && observation.photos.length > 0 && (
            <>
              <Separator />

              <div>
                <h3 className="font-medium mb-2">Photos ({observation.photos.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {observation.photos.map((photo, index) => (
                    <a 
                      key={index} 
                      href={photo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
