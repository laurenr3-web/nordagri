
import React from 'react';
import { Button } from '@/components/ui/button';
import { EquipmentCard } from '@/components/dashboard/EquipmentCard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { Link } from 'react-router-dom';
import { useEquipmentStatusData } from '@/hooks/dashboard/useEquipmentStatusData';
import { Skeleton } from '@/components/ui/skeleton';
import { EquipmentItem } from '@/hooks/dashboard/types/equipmentTypes';

interface EquipmentSectionProps {
  onViewAllClick: () => void;
  onEquipmentClick: (id: number) => void;
  equipmentData?: EquipmentItem[]; // Optional prop to override data from hook
}

const EquipmentSection: React.FC<EquipmentSectionProps> = ({ 
  onViewAllClick,
  onEquipmentClick,
  equipmentData: propEquipmentData
}) => {
  const { equipmentData: hookEquipmentData, loading, error } = useEquipmentStatusData();
  
  // Use prop data if provided, otherwise use data from the hook
  const equipmentData = propEquipmentData || hookEquipmentData || [];
  
  // Limit to 3 equipment items
  const displayedEquipment = equipmentData?.slice(0, 3) || [];

  // For debugging
  console.log('Equipment data available:', equipmentData?.length || 0);

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
      {loading && !propEquipmentData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(index => (
            <div key={index} className="border rounded-xl overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-2 w-full mb-3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">
          Error loading equipment. Please try again later.
        </p>
      ) : displayedEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedEquipment.map((item, index) => (
            <EquipmentCard 
              key={item.id} 
              name={item.name} 
              type={item.type} 
              image={item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'} 
              status={item.status} 
              usage={item.usage} 
              nextService={item.nextService} 
              style={{
                animationDelay: `${index * 0.15}s`
              }}
              onClick={() => onEquipmentClick(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
          <p className="text-center py-8 text-muted-foreground">
            Aucun équipement trouvé. Ajoutez votre premier équipement pour commencer.
          </p>
          <Button variant="outline" onClick={onViewAllClick}>
            Ajouter un équipement
          </Button>
        </div>
      )}
      
      {equipmentData.length > 3 && (
        <div className="mt-4 text-center">
          <Link 
            to="/equipment" 
            className="text-sm text-muted-foreground hover:underline"
          >
            View All Equipment →
          </Link>
        </div>
      )}
    </DashboardSection>
  );
};

export default EquipmentSection;
