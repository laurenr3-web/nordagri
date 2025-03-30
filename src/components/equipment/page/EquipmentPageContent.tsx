
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Sidebar } from '@/components/ui/sidebar';
import { useEquipmentState } from '@/components/equipment/hooks/useEquipmentState';
import EquipmentContentSection from './EquipmentContentSection';
import { Equipment } from '@/services/supabase/equipmentService';

interface EquipmentPageContentProps {
  equipment: Equipment[] | null;
  isLoading: boolean;
}

const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({
  equipment,
  isLoading
}) => {
  const {
    transformedEquipment,
    filterState,
    viewState,
    setSelectedEquipment,
    handleEquipmentClick
  } = useEquipmentState(equipment);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      
      <div className="flex-1 w-full">
        <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
          <div className="max-w-7xl mx-auto">
            <EquipmentContentSection
              equipment={transformedEquipment}
              isLoading={isLoading}
              filterState={filterState}
              viewState={viewState}
              handleEquipmentClick={handleEquipmentClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPageContent;
