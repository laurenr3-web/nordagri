
import React from 'react';
import { DashboardSection } from './DashboardSection';

interface EquipmentItem {
  id: number;
  name: string;
  type: string;
}

interface EquipmentSectionRefinedProps {
  equipmentData: EquipmentItem[];
  isEditing: boolean;
  onViewAll: () => void;
  onEquipmentClick: (id: number) => void;
}

export const EquipmentSectionRefined: React.FC<EquipmentSectionRefinedProps> = ({
  equipmentData,
  isEditing,
  onViewAll,
  onEquipmentClick
}) => {
  return (
    <DashboardSection
      id="equipment"
      title="État des équipements"
      subtitle="Surveillez les performances de votre flotte"
      isEditing={isEditing}
      actionLabel="Voir tout"
      onAction={onViewAll}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipmentData.map((item) => (
          <div 
            key={item.id}
            className="cursor-pointer"
            onClick={() => onEquipmentClick(item.id)}
          >
            <div className="border rounded-md p-4 hover:border-primary transition-colors">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.type}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
};
