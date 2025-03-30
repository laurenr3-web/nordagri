
import React from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentDetails from './EquipmentDetails';
import EquipmentImageGallery from './EquipmentImageGallery';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import { Card, CardContent } from '@/components/ui/card';

interface EquipmentOverviewProps {
  equipment: EquipmentItem;
}

const EquipmentOverview: React.FC<EquipmentOverviewProps> = ({ equipment }) => {
  // Helper function to check if equipment has maintenance data
  const hasMaintenanceData = (): boolean => {
    return equipment.status === 'maintenance' || 
           (equipment.usage && (equipment.usage.hours > 0 || equipment.usage.target > 0)) || 
           equipment.nextService !== undefined;
  };
  
  // Helper function to check if equipment has image data
  const hasImageData = (): boolean => {
    return !!equipment.image && equipment.image.trim() !== '';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="border-2 border-primary/10">
          <CardContent className="p-6">
            <EquipmentDetails equipment={equipment} />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        {hasImageData() && (
          <Card className="border-2 border-secondary/20">
            <CardContent className="p-6">
              <EquipmentImageGallery equipment={equipment} />
            </CardContent>
          </Card>
        )}
        
        {hasMaintenanceData() && (
          <Card className="border-2 border-muted/20">
            <CardContent className="p-6">
              <EquipmentMaintenanceStatus equipment={equipment} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EquipmentOverview;
