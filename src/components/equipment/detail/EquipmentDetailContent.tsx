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
import StatusCard from './StatusCard';
import CounterCard from './CounterCard';
import MaintenancePriorityCard from './MaintenancePriorityCard';
import EquipmentPointsCard from './EquipmentPointsCard';
import MachineJournalCard from './MachineJournalCard';
import LinkedPartsCard from './LinkedPartsCard';
import FuelSummaryCard from './FuelSummaryCard';
import QRCompactCard from './QRCompactCard';
import EquipmentTabs from '../details/EquipmentTabs';
import UpdateHoursDialog from './UpdateHoursDialog';
import { NewPointDialog } from '@/components/points/NewPointDialog';
import AddMaintenanceDialog from '@/components/maintenance/dialogs/AddMaintenanceDialog';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const unitLabel = (localEquipment.unite_d_usure || 'heures') === 'heures' ? 'Heures moteur' : 'Kilomètres';

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

  const scrollToQR = () => {
    document.getElementById('equipment-qr-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddIntervention = () => {
    navigate(`/interventions?equipment=${localEquipment.id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 pb-16 space-y-6">
      <EquipmentHeader
        equipment={localEquipment}
        onEdit={handleEditEquipment}
        onDelete={handleEquipmentDelete}
        isDeleting={isDeleting}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* État actuel pleine largeur */}
      <StatusCard equipment={localEquipment} />

      {/* Actions rapides pleine largeur */}
      {canEdit && (
        <QuickActions
          onUpdateCounter={() => setIsUpdateHoursOpen(true)}
          onAddMaintenance={() => setIsAddMaintenanceOpen(true)}
          onAddPoint={handleOpenObservation}
          onAddIntervention={handleAddIntervention}
          onLinkPart={() => setIsAddPartOpen(true)}
          onShowQR={scrollToQR}
          unitLabel={unitLabel}
        />
      )}

      {/* Contenu 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne gauche ~65% */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mobile: compteur en premier */}
          <div className="lg:hidden">
            <CounterCard equipment={localEquipment} onUpdate={() => setIsUpdateHoursOpen(true)} canEdit={canEdit} />
          </div>

          <MaintenancePriorityCard equipment={localEquipment} canEdit={canEdit} />
          <EquipmentPointsCard equipment={localEquipment} canEdit={canEdit} />

          {/* Mobile: pièces avant journal */}
          <div className="lg:hidden">
            <LinkedPartsCard equipment={localEquipment} canEdit={canEdit} />
          </div>

          <MachineJournalCard equipment={localEquipment} />

          <div className="lg:hidden space-y-6">
            <FuelSummaryCard equipment={localEquipment} canEdit={canEdit} />
            <QRCompactCard equipment={localEquipment} />
          </div>
        </div>

        {/* Colonne droite ~35% (desktop only) */}
        <aside className="hidden lg:flex lg:flex-col lg:gap-6 lg:col-span-4">
          <CounterCard equipment={localEquipment} onUpdate={() => setIsUpdateHoursOpen(true)} canEdit={canEdit} />
          <LinkedPartsCard equipment={localEquipment} canEdit={canEdit} />
          <FuelSummaryCard equipment={localEquipment} canEdit={canEdit} />
          <QRCompactCard equipment={localEquipment} />
        </aside>
      </div>

      {/* Onglets détaillés en bas, pleine largeur */}
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vue détaillée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div data-tour="equipment-tabs">
            <EquipmentTabs equipment={localEquipment} />
          </div>
        </CardContent>
      </Card>

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
