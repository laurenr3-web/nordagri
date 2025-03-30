
import React from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentDetails from './EquipmentDetails';
import EquipmentImageGallery from './EquipmentImageGallery';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';

interface EquipmentOverviewProps {
  equipment: EquipmentItem;
}

const EquipmentOverview: React.FC<EquipmentOverviewProps> = ({ equipment }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <EquipmentDetails equipment={equipment} />
      </div>
      
      <div className="space-y-6">
        <EquipmentImageGallery equipment={equipment} />
        <EquipmentMaintenanceStatus equipment={equipment} />
      </div>
    </div>
  );
};

export default EquipmentOverview;
