
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle, Plus } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddMaintenanceDialog from '@/components/maintenance/dialogs/AddMaintenanceDialog';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { toast } from 'sonner';

interface EquipmentMaintenanceStatusProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenanceStatus: React.FC<EquipmentMaintenanceStatusProps> = ({ equipment }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Utilisez la véritable prochaine maintenance si disponible via l'equipment.nextService
  const nextMaintenance = equipment.nextService ? {
    type: equipment.nextService.type,
    dueDate: new Date(equipment.nextService.due)
  } : {
    type: 'Entretien régulier',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) // Dans 15 jours (fallback)
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
      return format(date, 'd MMMM yyyy', { locale: fr });
    }
  };

  const isMaintenanceOverdue = () => {
    const now = new Date();
    return nextMaintenance.dueDate < now;
  };

  const handleAddMaintenance = async (maintenanceData: any) => {
    try {
      await maintenanceService.addTask({
        ...maintenanceData,
      });
      
      toast.success('Maintenance créée avec succès');
      
      // Recharger la page pour afficher la nouvelle maintenance
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la maintenance:", error);
      toast.error("Impossible d'ajouter la maintenance");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div>
          <CardTitle>Maintenance</CardTitle>
          <CardDescription>Statut de maintenance</CardDescription>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Nouvelle maintenance
        </Button>
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
            <div className={`${isMaintenanceOverdue() ? 'bg-red-500/10' : 'bg-orange-500/10'} p-2 rounded-full`}>
              <Clock className={`h-5 w-5 ${isMaintenanceOverdue() ? 'text-red-500' : 'text-orange-500'}`} />
            </div>
            <div>
              <p className="font-medium">Échéance</p>
              <p className={`text-sm ${isMaintenanceOverdue() ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                {formatDueDate(nextMaintenance.dueDate)}
              </p>
            </div>
          </div>
          
          {isMaintenanceOverdue() && (
            <div className="flex items-start space-x-3">
              <div className="bg-red-500/10 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-red-500">Maintenance en retard</p>
                <p className="text-sm text-red-700">
                  Une maintenance est requise pour cet équipement
                </p>
              </div>
            </div>
          )}
          
          {equipment.status === 'maintenance' && (
            <div className="flex items-start space-x-3">
              <div className="bg-amber-500/10 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-amber-700">Actuellement en maintenance</p>
                <p className="text-sm text-muted-foreground">L'équipement n'est pas disponible</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <AddMaintenanceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddMaintenance}
        equipment={equipment}
      />
    </Card>
  );
};

export default EquipmentMaintenanceStatus;
