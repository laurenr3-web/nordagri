
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import { MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import NewMaintenanceDialog from './maintenance/NewMaintenanceDialog';
import MaintenanceSummaryCards from './maintenance/MaintenanceSummaryCards';
import MaintenanceCalendarTable from './maintenance/MaintenanceCalendarTable';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { formatDate, getStatusBadge, getPriorityColor } from './maintenance/maintenanceUtils';

interface EquipmentMaintenanceProps {
  equipment: EquipmentItem;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const [loading, setLoading] = useState(true);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  
  // Utiliser le hook useTasksManager pour gérer les tâches de maintenance
  const {
    tasks: maintenanceTasks,
    isLoading: tasksLoading,
    addTask,
    updateTaskStatus,
    deleteTask
  } = useTasksManager();

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

  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handleCreateMaintenance = (maintenance: any) => {
    try {
      // Préparer les données pour l'API
      const maintenanceTask = {
        title: maintenance.title,
        equipment: equipment.name,
        equipmentId: equipment.id,
        type: maintenance.type as MaintenanceType,
        status: 'scheduled' as MaintenanceStatus,
        priority: maintenance.priority as MaintenancePriority,
        dueDate: maintenance.dueDate,
        estimatedDuration: maintenance.estimatedDuration,
        assignedTo: '',
        notes: maintenance.notes || '',
        partId: maintenance.partId || null
      };
      
      // Ajouter la tâche via le hook
      addTask(maintenanceTask);
      
      // Fermer la boîte de dialogue
      setIsNewMaintenanceOpen(false);
      
      toast.success('Tâche de maintenance créée avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      toast.error('Impossible d\'ajouter la tâche de maintenance');
    }
  };

  const handleDeleteTask = (taskId: number) => {
    try {
      deleteTask(taskId);
      toast.success('Tâche supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error('Impossible de supprimer la tâche');
    }
  };

  const handleChangeStatus = (taskId: number, newStatus: string) => {
    try {
      updateTaskStatus(taskId, newStatus as MaintenanceStatus);
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const handlePartAdded = (partData: any) => {
    toast.success(`La pièce ${partData.name} a été ajoutée avec succès!`);
    setIsAddPartDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance de l'équipement</h2>
        <div className="flex space-x-2">
          <Button onClick={handleAddPart} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle pièce
          </Button>
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Afficher une grande image de l'équipement */}
      <Card>
        <CardHeader>
          <CardTitle>Image de l'équipement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <img
              src={equipment.image || "https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=1280&auto=format&fit=crop"}
              alt={equipment.name}
              className="object-cover w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

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
            handleChangeStatus={handleChangeStatus}
            handleAddTask={handleAddTask}
            handleDeleteTask={handleDeleteTask}
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
      
      {/* Dialog pour ajouter une pièce */}
      <AddPartDialog
        isOpen={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
        onSuccess={handlePartAdded}
      />
    </div>
  );
};

export default EquipmentMaintenance;
