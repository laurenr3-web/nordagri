
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentMaintenanceStatusProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenanceStatus: React.FC<EquipmentMaintenanceStatusProps> = ({ equipment }) => {
  // Fictif pour démonstration
  const nextMaintenance = {
    type: 'Entretien régulier',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) // Dans 15 jours
  };
  
  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `En retard de ${Math.abs(diffDays)} jours`;
    } else if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Demain';
    } else if (diffDays < 30) {
      return `Dans ${diffDays} jours`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Maintenance</CardTitle>
        <CardDescription>Statut de maintenance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Prochaine maintenance</p>
              <p className="text-sm text-muted-foreground">{nextMaintenance.type}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-orange-500/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium">Échéance</p>
              <p className="text-sm text-muted-foreground">{formatDueDate(nextMaintenance.dueDate)}</p>
            </div>
          </div>
          
          {equipment.status === 'maintenance' && (
            <div className="flex items-start space-x-3">
              <div className="bg-destructive/10 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium">Actuellement en maintenance</p>
                <p className="text-sm text-muted-foreground">L'équipement n'est pas disponible</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentMaintenanceStatus;
