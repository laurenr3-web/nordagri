
import React, { useState } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Intervention } from '@/types/Intervention';
import { MapPin, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/interventionUtils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PriorityBadge from '../PriorityBadge';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';

interface FieldTrackingViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

const FieldTrackingView: React.FC<FieldTrackingViewProps> = ({ interventions, onViewDetails }) => {
  const fieldInterventions = interventions.filter(i => i.status === 'in-progress');
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  const { refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getInterventions(),
    enabled: false // Don't fetch automatically
  });

  const handleCompleteIntervention = async (intervention: Intervention) => {
    try {
      // Update the intervention status to completed
      await interventionService.updateInterventionStatus(intervention.id, 'completed');
      toast.success('Intervention terminée avec succès');
      refetch(); // Refetch interventions to update the list
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'intervention', { 
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  if (fieldInterventions.length === 0) {
    return (
      <BlurContainer className="p-8 text-center">
        <p className="text-muted-foreground">Aucune intervention en cours sur le terrain</p>
      </BlurContainer>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 lg:col-span-2">
        <h3 className="font-medium text-lg mb-4">Interventions en cours ({fieldInterventions.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldInterventions.map(intervention => (
            <Card 
              key={intervention.id}
              className={`cursor-pointer hover:shadow-md transition-all ${
                selectedIntervention?.id === intervention.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedIntervention(intervention)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium truncate">{intervention.title}</CardTitle>
                  <PriorityBadge priority={intervention.priority} />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{intervention.technician}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{intervention.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(intervention.date)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(intervention);
                  }}
                >
                  Détails
                </Button>
                <Button 
                  size="sm"
                  variant="default"
                  className="ml-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteIntervention(intervention);
                  }}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Terminer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="col-span-1">
        {selectedIntervention ? (
          <BlurContainer className="p-5 sticky top-4">
            <h3 className="font-medium text-lg mb-3">Détails de l'intervention</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedIntervention.title}</h4>
                <Badge variant="outline" className="mt-1">
                  {selectedIntervention.equipment}
                </Badge>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Technicien:</span>
                  <span className="font-medium">{selectedIntervention.technician}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Durée prévue:</span>
                  <span className="font-medium">{selectedIntervention.scheduledDuration} heures</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(selectedIntervention.date)}</span>
                </div>
              </div>

              {selectedIntervention.description && (
                <div>
                  <h5 className="font-medium mb-1">Description</h5>
                  <p className="text-sm text-muted-foreground">{selectedIntervention.description}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewDetails(selectedIntervention)}
                >
                  Voir les détails complets
                </Button>
                <Button 
                  size="sm"
                  variant="default"
                  onClick={() => handleCompleteIntervention(selectedIntervention)}
                >
                  Terminer
                </Button>
              </div>
            </div>
          </BlurContainer>
        ) : (
          <BlurContainer className="p-5 text-center">
            <p className="text-muted-foreground">Sélectionnez une intervention pour voir les détails</p>
          </BlurContainer>
        )}
      </div>
    </div>
  );
};

export default FieldTrackingView;
