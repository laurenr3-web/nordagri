
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Calendar, MapPin, User, Clock, FileText, AlertCircle } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '../utils/interventionUtils';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from './BadgeUtils';

interface DialogContentProps {
  intervention: Intervention;
}

const InterventionDialogContent: React.FC<DialogContentProps> = ({ intervention }) => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge variant={getStatusBadgeVariant(intervention.status)}>
          {intervention.status === 'scheduled' && 'Planifié'}
          {intervention.status === 'in-progress' && 'En cours'}
          {intervention.status === 'completed' && 'Terminé'}
          {intervention.status === 'canceled' && 'Annulé'}
        </Badge>
        <Badge variant={getPriorityBadgeVariant(intervention.priority)}>
          {intervention.priority === 'high' && 'Priorité haute'}
          {intervention.priority === 'medium' && 'Priorité moyenne'}
          {intervention.priority === 'low' && 'Priorité basse'}
        </Badge>
      </div>

      <Card className="mb-4 border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {typeof intervention.date === 'string' 
                      ? formatDate(new Date(intervention.date)) 
                      : formatDate(intervention.date)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Lieu</p>
                  <p className="font-medium">{intervention.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Équipement</p>
                  <p className="font-medium">{intervention.equipment}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Technicien</p>
                  <p className="font-medium">{intervention.technician || 'Non assigné'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Durée prévue</p>
                <p className="font-medium">{intervention.scheduledDuration} heure(s)</p>
              </div>
            </div>

            {intervention.status === 'completed' && intervention.duration && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Durée réelle</p>
                  <p className="font-medium">{intervention.duration} heure(s)</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm mt-1">
                  {intervention.description || 'Aucune description'}
                </p>
              </div>
            </div>

            {intervention.notes && (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm mt-1">{intervention.notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {intervention.partsUsed && intervention.partsUsed.length > 0 && (
        <PartsUsedSection partsUsed={intervention.partsUsed} />
      )}
    </>
  );
};

const PartsUsedSection: React.FC<{ partsUsed: Array<{ name: string; quantity: number }> }> = ({ partsUsed }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <h3 className="text-md font-medium mb-3">Pièces utilisées</h3>
        <ul className="space-y-2">
          {partsUsed.map((part, index) => (
            <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="font-medium">{part.name}</span>
              <Badge variant="outline">Quantité: {part.quantity}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default InterventionDialogContent;
