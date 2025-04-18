
import React from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import EquipmentDetailLoading from '@/components/equipment/detail/EquipmentDetailLoading';
import EquipmentDetailError from '@/components/equipment/detail/EquipmentDetailError';
import EquipmentDetailContent from '@/components/equipment/detail/EquipmentDetailContent';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { equipment, loading, error, handleEquipmentUpdate } = useEquipmentDetail(id);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="flex justify-end p-4 border-b">
            <MaintenanceNotificationsPopover />
          </div>
          
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
            <div className="max-w-7xl mx-auto">
              {loading && (
                <EquipmentDetailLoading id={id} />
              )}
              
              {!loading && error && (
                <EquipmentDetailError id={id} error={error} />
              )}
              
              {!loading && !error && equipment && (
                <EquipmentDetailContent 
                  equipment={equipment}
                  onUpdate={async (updatedData) => {
                    await handleEquipmentUpdate(updatedData);
                    // Return void to match the expected type
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EquipmentDetail;
