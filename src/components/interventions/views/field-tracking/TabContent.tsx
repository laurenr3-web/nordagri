
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Intervention } from '@/types/Intervention';
import { Clock, MapPin, User, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TabContentProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onUpdateStatus?: (interventionId: number, newStatus: string) => void;
  onAssignTechnician?: (intervention: Intervention) => void;
  status: 'scheduled' | 'in-progress' | 'completed';
}

const TabContent: React.FC<TabContentProps> = ({
  interventions,
  onViewDetails,
  onUpdateStatus,
  onAssignTechnician,
  status
}) => {
  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Message d'état vide
  const getEmptyStateMessage = () => {
    switch (status) {
      case 'scheduled':
        return 'Aucune intervention planifiée pour le moment.';
      case 'in-progress':
        return 'Aucune intervention en cours pour le moment.';
      case 'completed':
        return 'Aucune intervention terminée pour le moment.';
      default:
        return 'Aucune intervention trouvée.';
    }
  };
  
  if (interventions.length === 0) {
    return (
      <BlurContainer className="p-4 text-center text-muted-foreground">
        {getEmptyStateMessage()}
      </BlurContainer>
    );
  }

  return (
    <div className="space-y-4">
      {interventions.map(intervention => (
        <BlurContainer 
          key={intervention.id} 
          className="p-4"
          raised
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-start gap-2 mb-2">
                {status === 'completed' ? (
                  <Badge variant="secondary">Terminée</Badge>
                ) : (
                  <Badge 
                    variant={
                      intervention.priority === 'high' ? 'destructive' : 
                      intervention.priority === 'medium' ? 'default' : 'outline'
                    }
                  >
                    {intervention.priority === 'high' ? 'Haute' : 
                    intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </Badge>
                )}
                <h3 className="font-semibold">{intervention.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{intervention.equipment}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {format(intervention.date, 'dd MMMM yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
                
                {status !== 'completed' && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{intervention.location}</span>
                  </div>
                )}
                
                {status === 'in-progress' ? (
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs">
                        {intervention.technician ? getInitials(intervention.technician) : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {intervention.technician || 'Non assigné'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {intervention.technician || 'Non assigné'}
                    </span>
                  </div>
                )}
                
                {status === 'completed' && intervention.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Durée: {intervention.duration} h
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {/* Actions pour les interventions planifiées */}
              {status === 'scheduled' && (
                <>
                  {!intervention.technician && onAssignTechnician && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onAssignTechnician(intervention)}
                    >
                      Assigner
                    </Button>
                  )}
                  
                  {onUpdateStatus && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onUpdateStatus(intervention.id, 'in-progress')}
                    >
                      Démarrer
                    </Button>
                  )}
                </>
              )}
              
              {/* Actions pour les interventions en cours */}
              {status === 'in-progress' && onUpdateStatus && (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onUpdateStatus(intervention.id, 'completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onUpdateStatus(intervention.id, 'canceled')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewDetails(intervention)}
              >
                {status === 'completed' ? 'Rapport' : 'Détails'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </BlurContainer>
      ))}
    </div>
  );
};

export default TabContent;
