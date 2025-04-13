
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import EquipmentDetailLoading from '@/components/equipment/detail/EquipmentDetailLoading';
import EquipmentDetailError from '@/components/equipment/detail/EquipmentDetailError';
import EquipmentDetailContent from '@/components/equipment/detail/EquipmentDetailContent';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { equipment, loading, error, handleEquipmentUpdate } = useEquipmentDetail(id);
  
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
              error={typeof error === 'string' ? error : error instanceof Error ? error.message : String(error)} 
            />
          )}
          
          {!loading && !error && equipment && (
            <EquipmentDetailContent 
              equipment={equipment}
              onUpdate={async (updatedData) => {
                await handleEquipmentUpdate(updatedData);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
