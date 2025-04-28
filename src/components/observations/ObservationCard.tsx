
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  MapPinIcon, 
  AlertCircle, 
  Eye, 
  User, 
  Tag 
} from 'lucide-react';
import { FieldObservation } from '@/types/FieldObservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ObservationCardProps {
  observation: FieldObservation;
  onView: (observation: FieldObservation) => void;
}

export const ObservationCard: React.FC<ObservationCardProps> = ({ 
  observation, 
  onView 
}) => {
  // Formatage de la date
  const formattedDate = observation.date ? format(
    new Date(observation.date),
    'PPP',
    { locale: fr }
  ) : '';

  // Déterminer la couleur du badge d'urgence
  const getUrgencyBadge = () => {
    switch(observation.urgency_level) {
      case 'urgent':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Urgent</span>
          </Badge>
        );
      case 'surveiller':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>À surveiller</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>Normal</span>
          </Badge>
        );
    }
  };

  // Déterminer la couleur du badge de type d'observation
  const getTypeBadge = () => {
    switch(observation.observation_type) {
      case 'panne':
        return (
          <Badge className="bg-red-100 text-red-800">
            Panne
          </Badge>
        );
      case 'usure':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Usure
          </Badge>
        );
      case 'anomalie':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Anomalie
          </Badge>
        );
      case 'entretien':
        return (
          <Badge className="bg-green-100 text-green-800">
            Entretien
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Autre
          </Badge>
        );
    }
  };

  // Couleur de bordure selon l'urgence
  const getUrgencyBorderClass = () => {
    switch(observation.urgency_level) {
      case 'urgent':
        return 'border-l-4 border-l-red-500';
      case 'surveiller':
        return 'border-l-4 border-l-amber-500';
      default:
        return 'border-l-4 border-l-green-500';
    }
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${getUrgencyBorderClass()}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold truncate">{observation.equipment}</h3>
            <div className="flex gap-1 flex-shrink-0">
              {getUrgencyBadge()}
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag size={14} />
            <span className="flex gap-1">
              <span>Type:</span>
              {getTypeBadge()}
            </span>
          </div>
          
          {observation.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPinIcon size={14} />
              <span className="truncate">{observation.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarIcon size={14} />
            <span>{formattedDate}</span>
          </div>
          
          {observation.description && (
            <p className="text-sm line-clamp-2 mt-2 bg-muted/30 p-2 rounded-md">
              {observation.description}
            </p>
          )}
          
          {/* Afficher l'aperçu d'une photo si disponible */}
          {observation.photos && observation.photos.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {observation.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                ))}
                {observation.photos.length > 3 && (
                  <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md">
                    <span className="text-xs font-medium">+{observation.photos.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-background border-t p-3 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => onView(observation)}
        >
          <Eye size={16} />
          <span>Détails</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
