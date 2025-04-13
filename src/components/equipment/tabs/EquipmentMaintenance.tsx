
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import { useParams } from 'react-router-dom';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { adaptServiceTaskToModelTask } from '@/hooks/maintenance/adapters/maintenanceTypeAdapters';
import NewMaintenanceDialog from './maintenance/NewMaintenanceDialog';
import MaintenanceSummaryCards from './maintenance/MaintenanceSummaryCards';
import MaintenanceCalendarTable from './maintenance/MaintenanceCalendarTable';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { formatDate, getStatusBadge, getPriorityColor } from './maintenance/maintenanceUtils';
import MaintenanceQuoteDialog from './maintenance/MaintenanceQuoteDialog';
import MaintenanceCompletionDialog from '@/components/maintenance/dialogs/MaintenanceCompletionDialog';
import MaintenancePlanDialog from '@/components/maintenance/dialogs/MaintenancePlanDialog';
import { MaintenanceFormValues } from '@/hooks/maintenance/types/maintenancePlanTypes';

interface EquipmentMaintenanceProps {
  equipment: any;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const { id } = useParams<{ id: string }>();
  const { maintenanceTasks: serviceTasks } = useEquipmentDetail(id);
  const [loading, setLoading] = useState(false);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState<any>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  
  // Convert service tasks to model tasks for rendering
  const maintenanceTasks = serviceTasks ? serviceTasks.map(adaptServiceTaskToModelTask) : [];

  const handleAddTask = () => {
    setIsNewMaintenanceOpen(true);
  };

  const handleCreatePlan = () => {
    setIsPlanDialogOpen(true);
  };

  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handleCompleteTask = (taskId: number) => {
    // Find the task with the matching ID
    const task = serviceTasks?.find(task => task.id === taskId);
    if (task) {
      setSelectedMaintenanceTask(task);
      setIsCompletionDialogOpen(true);
    } else {
      toast.error('Tâche non trouvée');
    }
  };

  const handleCreateMaintenance = async (maintenance: any) => {
    try {
      setLoading(true);
      
      // Prepare the data for the API
      const maintenanceTask: MaintenanceFormValues = {
        title: maintenance.title,
        equipment_id: equipment.id,
        equipment: equipment.name,
        type: maintenance.type,
        status: 'scheduled',
        priority: maintenance.priority,
        due_date: maintenance.dueDate,
        estimated_duration: maintenance.engineHours,
        assigned_to: maintenance.assignedTo || '',
        notes: maintenance.notes || ''
      };
      
      // Add the task via the service
      await maintenanceService.addTask(maintenanceTask);
      
      // Close the dialog
      setIsNewMaintenanceOpen(false);
      
      toast.success('Tâche de maintenance créée avec succès!');
      
      // Refresh the page to see the new task
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      toast.error('Impossible d\'ajouter la tâche de maintenance: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuote = (taskId: number) => {
    // Find the task with the matching ID
    const task = serviceTasks?.find(task => task.id === taskId);
    if (task) {
      setSelectedMaintenanceTask({
        ...task,
        equipment: equipment,
        estimatedDuration: task.estimated_duration
      });
      setIsQuoteDialogOpen(true);
    } else {
      toast.error('Tâche non trouvée');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setLoading(true);
      await maintenanceService.deleteTask(taskId);
      toast.success('Tâche supprimée avec succès');
      
      // Refresh the page to see the changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error('Impossible de supprimer la tâche: ' + error.message);
    } finally {
      setLoading(false);
      setIsQuoteDialogOpen(false);
    }
  };

  const handleChangeStatus = async (taskId: number, newStatus: string) => {
    try {
      setLoading(true);
      await maintenanceService.updateTaskStatus(taskId, newStatus);
      toast.success(`Statut mis à jour: ${newStatus}`);
      
      // Refresh the page to see the changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut: ' + error.message);
    } finally {
      setLoading(false);
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
          <Button onClick={handleCreatePlan} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Nouveau plan
          </Button>
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
            handleCompleteTask={handleCompleteTask}
          />
        </CardContent>
      </Card>

      {/* Dialog for creating new maintenance */}
      {isNewMaintenanceOpen && (
        <NewMaintenanceDialog
          equipment={equipment}
          isOpen={isNewMaintenanceOpen}
          onClose={() => setIsNewMaintenanceOpen(false)}
          onSubmit={handleCreateMaintenance}
        />
      )}

      {/* Dialog for adding a part */}
      <AddPartDialog
        isOpen={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
        onSuccess={handlePartAdded}
      />

      {/* Dialog for showing maintenance quote */}
      <MaintenanceQuoteDialog
        isOpen={isQuoteDialogOpen}
        onClose={() => setIsQuoteDialogOpen(false)}
        maintenance={selectedMaintenanceTask}
        onDelete={handleDeleteTask}
      />

      {/* Dialog for completing a maintenance task */}
      {isCompletionDialogOpen && selectedMaintenanceTask && (
        <MaintenanceCompletionDialog
          open={isCompletionDialogOpen}
          onOpenChange={() => setIsCompletionDialogOpen(false)}
          task={selectedMaintenanceTask}
          onCompleted={() => {
            setIsCompletionDialogOpen(false);
            // Refresh the task list
            setTimeout(() => window.location.reload(), 1000);
          }}
        />
      )}

      {/* Dialog for creating a maintenance plan */}
      <MaintenancePlanDialog
        isOpen={isPlanDialogOpen}
        onClose={() => setIsPlanDialogOpen(false)}
        equipment={{ id: Number(equipment?.id), name: equipment?.name }}
      />
    </div>
  );
};

export default EquipmentMaintenance;
