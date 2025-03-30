
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import { useParams } from 'react-router-dom';
import { MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import NewMaintenanceDialog from './maintenance/NewMaintenanceDialog';
import MaintenanceSummaryCards from './maintenance/MaintenanceSummaryCards';
import MaintenanceCalendarTable from './maintenance/MaintenanceCalendarTable';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { formatDate, getStatusBadge, getPriorityColor } from './maintenance/maintenanceUtils';

interface EquipmentMaintenanceProps {
  equipment: any;
}

const EquipmentMaintenance: React.FC<EquipmentMaintenanceProps> = ({ equipment }) => {
  const { id } = useParams<{ id: string }>();
  const { maintenanceTasks } = useEquipmentDetail(id);
  const [loading, setLoading] = useState(false);
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);

  const handleAddTask = () => {
    setIsNewMaintenanceOpen(true);
  };

  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };

  const handleCreateMaintenance = async (maintenance: any) => {
    try {
      setLoading(true);
      
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
        assignedTo: maintenance.assignedTo || '',
        notes: maintenance.notes || '',
        partId: maintenance.partId || null
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
    toast.info('La fonctionnalité de visualisation des devis a été désactivée');
  };

  const handleChangeStatus = async (taskId: number, newStatus: string) => {
    try {
      setLoading(true);
      await maintenanceService.updateTaskStatus(taskId, newStatus as MaintenanceStatus);
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
