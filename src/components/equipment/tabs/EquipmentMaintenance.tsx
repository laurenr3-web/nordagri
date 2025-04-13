
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import { useParams } from 'react-router-dom';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import NewMaintenanceDialog from './maintenance/NewMaintenanceDialog';
import MaintenanceSummaryCards from './maintenance/MaintenanceSummaryCards';
import MaintenanceCalendarTable from './maintenance/MaintenanceCalendarTable';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { formatDate, getStatusBadge, getPriorityColor } from './maintenance/maintenanceUtils';
import MaintenanceQuoteDialog from './maintenance/MaintenanceQuoteDialog';
import MaintenanceCompletionDialog from '@/components/maintenance/dialogs/MaintenanceCompletionDialog';
import MaintenancePlanDialog from '@/components/maintenance/dialogs/MaintenancePlanDialog';

interface EquipmentMaintenanceProps {
  equipment: any;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const { id } = useParams<{ id: string }>();
  const { maintenanceTasks } = useEquipmentDetail(id);
  const [loading, setLoading] = useState(false);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [selectedMaintenanceTask, setSelectedMaintenanceTask] = useState<any>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

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
    // Trouver la tâche avec l'ID correspondant
    const task = maintenanceTasks?.find(task => task.id === taskId);
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
      
      // Préparer les données pour l'API
      const maintenanceTask = {
        title: maintenance.title,
        equipment: equipment.name,
        equipment_id: equipment.id,
        type: maintenance.type,
        status: 'scheduled',
        priority: maintenance.priority,
        due_date: maintenance.dueDate.toISOString(),
        estimated_duration: maintenance.engineHours,
        assigned_to: maintenance.assignedTo || '',
        notes: maintenance.notes || ''
      };
      
      // Ajouter la tâche via le service
      await maintenanceService.addTask(maintenanceTask);
      
      // Fermer la boîte de dialogue
      setIsNewMaintenanceOpen(false);
      
      toast.success('Tâche de maintenance créée avec succès!');
      
      // Rafraîchir la page pour voir la nouvelle tâche
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
    const task = maintenanceTasks?.find(task => task.id === taskId);
    if (task) {
      setSelectedMaintenanceTask({
        ...task,
        equipment: equipment,
        estimatedDuration: task.engineHours
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
      
      // Rafraîchir la page pour voir les changements
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
      
      // Rafraîchir la page pour voir les changements
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
        maintenanceTasks={maintenanceTasks || []} 
        formatDate={formatDate} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Calendrier de maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <MaintenanceCalendarTable 
            tasks={maintenanceTasks || []}
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

      {/* Dialog pour afficher le devis de maintenance */}
      <MaintenanceQuoteDialog
        isOpen={isQuoteDialogOpen}
        onClose={() => setIsQuoteDialogOpen(false)}
        maintenance={selectedMaintenanceTask}
        onDelete={handleDeleteTask}
      />

      {/* Dialog pour compléter une tâche de maintenance */}
      {isCompletionDialogOpen && selectedMaintenanceTask && (
        <MaintenanceCompletionDialog
          isOpen={isCompletionDialogOpen}
          onClose={() => setIsCompletionDialogOpen(false)}
          task={selectedMaintenanceTask}
          onCompleted={() => {
            setIsCompletionDialogOpen(false);
            // Refresh the task list
            setTimeout(() => window.location.reload(), 1000);
          }}
        />
      )}

      {/* Dialog pour créer un plan de maintenance */}
      <MaintenancePlanDialog
        isOpen={isPlanDialogOpen}
        onClose={() => setIsPlanDialogOpen(false)}
        equipment={{ id: Number(equipment?.id), name: equipment?.name }}
      />
    </div>
  );
};

export default EquipmentMaintenance;
