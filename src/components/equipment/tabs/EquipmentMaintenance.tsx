
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import NewMaintenanceDialog from './maintenance/NewMaintenanceDialog';
import MaintenanceSummaryCards from './maintenance/MaintenanceSummaryCards';
import MaintenanceCalendarTable from './maintenance/MaintenanceCalendarTable';
import { formatDate, getStatusBadge, getPriorityColor } from './maintenance/maintenanceUtils';

interface EquipmentMaintenanceProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const [loading, setLoading] = useState(true);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  
  // Utiliser le hook useTasksManager pour gérer les tâches de maintenance
  const {
    tasks: maintenanceTasks,
    isLoading: tasksLoading,
    addTask,
    updateTaskStatus,
    updateTaskPriority
  } = useTasksManager();

  // État pour stocker la tâche sélectionnée pour voir le devis
  const [selectedTaskForQuote, setSelectedTaskForQuote] = useState<number | null>(null);

  useEffect(() => {
    // Déjà géré par useTasksManager, mais on ajoute un délai simulé pour l'UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [equipment.id]);

  const handleAddTask = () => {
    setIsNewMaintenanceOpen(true);
  };

  const handleCreateMaintenance = (maintenance: any) => {
    try {
      // Préparer les données pour l'API
      const maintenanceTask = {
        title: maintenance.title,
        equipment: equipment.name,
        equipmentId: equipment.id,
        type: maintenance.type,
        status: 'scheduled',
        priority: maintenance.priority,
        dueDate: maintenance.dueDate,
        estimatedDuration: maintenance.estimatedDuration,
        assignedTo: '',
        notes: maintenance.notes || ''
      };
      
      // Ajouter la tâche via le hook
      addTask(maintenanceTask);
      
      // Fermer la boîte de dialogue
      setIsNewMaintenanceOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      toast.error('Impossible d\'ajouter la tâche de maintenance');
    }
  };

  const handleViewQuote = (taskId: number) => {
    setSelectedTaskForQuote(taskId);
    toast.info(`Affichage du devis pour la tâche ${taskId}`);
    // Dans une implémentation réelle, vous pourriez ouvrir un dialogue pour afficher le devis
  };

  const handleChangeStatus = (taskId: number, newStatus: string) => {
    try {
      updateTaskStatus(taskId, newStatus as any);
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance de l'équipement</h2>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      <MaintenanceSummaryCards 
        maintenanceTasks={maintenanceTasks} 
        formatDate={formatDate} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Calendrier de maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceCalendarTable 
            tasks={maintenanceTasks}
            loading={loading}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            getPriorityColor={getPriorityColor}
            handleViewQuote={handleViewQuote}
            handleChangeStatus={handleChangeStatus}
            handleAddTask={handleAddTask}
          />
        </CardContent>
      </Card>

      {/* Dialog pour créer une nouvelle maintenance */}
      {isNewMaintenanceOpen && (
        <NewMaintenanceDialog
          equipment={equipment}
          isOpen={isNewMaintenanceOpen}
          onClose={() => setIsNewMaintenanceOpen(false)}
          onSubmit={handleCreateMaintenance}
        />
      )}
    </div>
  );
};

export default EquipmentMaintenance;
