
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Intervention } from '@/types/Intervention';

interface InterventionDetailsSectionProps {
  intervention: Intervention;
}

export const InterventionDetailsSection: React.FC<InterventionDetailsSectionProps> = ({ intervention }) => {
  return (
    <div className="bg-muted/50 p-3 rounded-md mb-4">
      <h3 className="text-sm font-semibold mb-2">Détails de l'intervention</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Titre:</span> {intervention.title}
        </div>
        <div>
          <span className="text-muted-foreground">Équipement:</span> {intervention.equipment}
        </div>
        <div>
          <span className="text-muted-foreground">Date:</span> {format(
            typeof intervention.date === 'string' 
              ? new Date(intervention.date) 
              : intervention.date, 
            'dd/MM/yyyy', 
            { locale: fr }
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Technicien:</span> {intervention.technician || 'Non assigné'}
        </div>
      </div>
    </div>
  );
};
