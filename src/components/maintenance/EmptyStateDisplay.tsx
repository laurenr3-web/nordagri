
import React from 'react';
import { CheckCircle2, AlertTriangle, CalendarIcon, Loader2 } from 'lucide-react';

interface EmptyStateDisplayProps {
  currentView: string;
}

const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({ currentView }) => {
  switch (currentView) {
    case 'overdue':
      return (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune tâche en retard</h3>
          <p className="text-muted-foreground">
            Toutes vos tâches sont planifiées ou à jour.
          </p>
        </div>
      );
    case 'today':
      return (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Journée libre</h3>
          <p className="text-muted-foreground">
            Aucune tâche de maintenance n'est prévue pour aujourd'hui.
          </p>
        </div>
      );
    case 'upcoming':
      return (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune tâche à venir</h3>
          <p className="text-muted-foreground">
            Planifiez de nouvelles tâches de maintenance pour vos équipements.
          </p>
        </div>
      );
    case 'completed':
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune tâche complétée</h3>
          <p className="text-muted-foreground">
            Terminez vos tâches de maintenance pour les voir apparaître ici.
          </p>
        </div>
      );
    default:
      return (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-medium mb-2">Chargement des tâches</h3>
          <p className="text-muted-foreground">
            Veuillez patienter pendant le chargement des données...
          </p>
        </div>
      );
  }
};

export default EmptyStateDisplay;
