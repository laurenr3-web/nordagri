import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentHeader from './EquipmentHeader';
import EditEquipmentDialog from '../dialogs/EditEquipmentDialog';
import { equipmentService } from '@/services/supabase/equipmentService';
import { useFarmRole } from '@/hooks/useFarmRole';
import { useFarmId } from '@/hooks/useFarmId';
import { logger } from '@/utils/logger';
import QuickActions from './QuickActions';
import SummaryStrip from './SummaryStrip';
import PriorityActionCard from './PriorityActionCard';
import EquipmentTabs from '../details/EquipmentTabs';
import UpdateHoursDialog from './UpdateHoursDialog';
import { NewPointDialog } from '@/components/points/NewPointDialog';
import AddMaintenanceDialog from '@/components/maintenance/dialogs/AddMaintenanceDialog';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { maintenanceService } from '@/services/supabase/maintenanceService';

interface EquipmentDetailContentProps {
  equipment: EquipmentItem;
  onUpdate: (data: EquipmentItem) => Promise<void>;
}

const EquipmentDetailContent: React.FC<EquipmentDetailContentProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const [isUpdateHoursOpen, setIsUpdateHoursOpen] = useState(false);
  const [isObservationOpen, setIsObservationOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canEdit, canDelete } = useFarmRole();
  const { farmId } = useFarmId();

  React.useEffect(() => {
    setLocalEquipment(equipment);
  }, [equipment]);

  const handleEditEquipment = () => setIsEditDialogOpen(true);

  const handleEquipmentUpdate = async (updatedData: EquipmentItem) => {
    try {
      setLocalEquipment(updatedData);
      await onUpdate(updatedData);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', updatedData.id] });
      setIsEditDialogOpen(false);
      toast.success('Équipement mis à jour avec succès');
    } catch (error: any) {
      toast.error('Impossible de mettre à jour cet équipement', { description: error.message });
    }
  };

  const handleEquipmentDelete = async () => {
    try {
      setIsDeleting(true);
      const equipmentId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      await equipmentService.deleteEquipment(equipmentId);
      ['maintenance_tasks','maintenanceTasks','planningTasks','planning-tasks','interventions','equipment_photos']
        .forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success(`L'équipement ${equipment.name} a été supprimé avec succès`);
      navigate('/equipment');
    } catch (error: any) {
      toast.error(`Impossible de supprimer cet équipement: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const observationLabel = [localEquipment.name, localEquipment.model, localEquipment.year ? `(${localEquipment.year})` : '']
    .filter(Boolean).join(' ');

  const handleOpenObservation = () => {
    if (!farmId) {
      logger.error('[Equipment] No farmId for surveillance');
      toast.error('Une erreur est survenue, réessayez');
      return;
    }
    setIsObservationOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 pb-16 space-y-4">
      <EquipmentHeader
        equipment={localEquipment}
        onEdit={handleEditEquipment}
        onDelete={handleEquipmentDelete}
        isDeleting={isDeleting}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <SummaryStrip equipment={localEquipment} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriorityActionCard equipment={localEquipment} onNavigateToTab={setActiveTab} />
        {canEdit && (
          <QuickActions
            onUpdateCounter={() => setIsUpdateHoursOpen(true)}
            onAddMaintenance={() => setIsAddMaintenanceOpen(true)}
            onAddPoint={handleOpenObservation}
            onLinkPart={() => setIsAddPartOpen(true)}
            onShowQR={() => setActiveTab('qrcode')}
            onShowFuel={() => setActiveTab('fuel')}
            onShowPerformance={() => setActiveTab('performance')}
          />
        )}
      </div>

      <div data-tour="equipment-tabs">
        <EquipmentTabs equipment={localEquipment} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {isEditDialogOpen && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          equipment={localEquipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}

      <UpdateHoursDialog
        open={isUpdateHoursOpen}
        onOpenChange={setIsUpdateHoursOpen}
        equipmentId={localEquipment.id}
        currentValue={localEquipment.valeur_actuelle}
        unit={localEquipment.unite_d_usure || 'heures'}
        onUpdated={(newValue) => setLocalEquipment((prev) => ({ ...prev, valeur_actuelle: newValue }))}
      />

      {farmId && (
        <NewPointDialog
          open={isObservationOpen}
          onOpenChange={setIsObservationOpen}
          farmId={farmId}
          defaultValues={{ type: 'equipement', entityLabel: observationLabel }}
        />
      )}

      <AddMaintenanceDialog
        isOpen={isAddMaintenanceOpen}
        onClose={() => setIsAddMaintenanceOpen(false)}
        equipment={localEquipment}
        onSubmit={async (data: any) => {
          try {
            await maintenanceService.addTask({ ...data });
            toast.success('Maintenance créée');
            queryClient.invalidateQueries({ queryKey: ['maintenance_tasks'] });
            setIsAddMaintenanceOpen(false);
          } catch { toast.error("Erreur lors de l'ajout de la maintenance"); }
        }}
      />

      <AddPartDialog
        isOpen={isAddPartOpen}
        onOpenChange={setIsAddPartOpen}
        onSuccess={() => setIsAddPartOpen(false)}
      />
    </div>
  );
};

export default EquipmentDetailContent;
