
import React from 'react';
import { Button } from '@/components/ui/button';
import { EquipmentCard } from '@/components/dashboard/EquipmentCard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';

interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair';
  usage: {
    hours: number;
    target: number;
  };
  nextService: {
    type: string;
    due: string;
  };
}

interface EquipmentSectionProps {
  equipment: EquipmentItem[];
  onViewAllClick: () => void;
  onEquipmentClick: (id: number) => void;
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({ 
  equipment, 
  onViewAllClick,
  onEquipmentClick
}) => {
  return (
    <DashboardSection 
      title="Equipment Status" 
      subtitle="Monitor your fleet performance" 
      action={
        <Button variant="outline" size="sm" onClick={onViewAllClick}>
          View All
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item, index) => (
          <EquipmentCard 
            key={item.id} 
            name={item.name} 
            type={item.type} 
            image={item.image} 
            status={item.status} 
            usage={item.usage} 
            nextService={item.nextService} 
            className="" 
            style={{
              animationDelay: `${index * 0.15}s`
            } as React.CSSProperties}
            onClick={() => onEquipmentClick(item.id)}
          />
        ))}
      </div>
    </DashboardSection>
  );
};

export default EquipmentSection;
