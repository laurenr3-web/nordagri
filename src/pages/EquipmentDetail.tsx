
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import EquipmentDetailLoading from '@/components/equipment/detail/EquipmentDetailLoading';
import EquipmentDetailError from '@/components/equipment/detail/EquipmentDetailError';
import EquipmentDetailContent from '@/components/equipment/detail/EquipmentDetailContent';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';
import { withRetry } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EquipmentItem } from '@/types/models/equipment';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    equipment, 
    loading, 
    error, 
    handleEquipmentUpdate,
    // Nouvelles propriétés
    maintenanceTasks,
    maintenancePlans,
    equipmentParts
  } = useEquipmentDetail(id);
  
  console.log("EquipmentDetail rendering with equipment:", equipment?.id, "loading:", loading);
  
  const handleEquipmentUpdateWithRetry = async (updatedData: EquipmentItem): Promise<void> => {
    try {
      const toastId = 'equipment-update';
      toast.loading('Mise à jour en cours...', { id: toastId });
      
      await withRetry(async () => {
        try {
          await handleEquipmentUpdate(updatedData);
          toast.success('Équipement mis à jour avec succès', { id: toastId });
        } catch (error: any) {
          toast.error('Erreur lors de la mise à jour', { 
            id: toastId,
            description: error.message || 'Une erreur est survenue'
          });
          throw error;
        }
      });
    } catch (error) {
      console.error('Failed to update equipment after retries:', error);
      toast.error('Échec de la mise à jour après plusieurs tentatives', {
        description: 'Veuillez vérifier votre connexion et réessayer'
      });
    }
  };
  
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex justify-end border-b px-4 py-2">
        <MaintenanceNotificationsPopover />
      </div>
      
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="mx-auto max-w-7xl">
          {loading && (
            <EquipmentDetailLoading id={id} />
          )}
          
          {!loading && error && (
            <EquipmentDetailError 
              id={id} 
              error={error instanceof Error ? error.message : String(error)} 
            />
          )}
          
          {!loading && !error && equipment && (
            <EquipmentDetailContent 
              equipment={equipment}
              onUpdate={handleEquipmentUpdateWithRetry}
              maintenanceTasks={maintenanceTasks}
              maintenancePlans={maintenancePlans}
              parts={equipmentParts}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
