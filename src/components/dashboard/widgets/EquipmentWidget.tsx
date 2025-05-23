
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EquipmentCard } from '@/components/dashboard/EquipmentCard';

interface EquipmentWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const EquipmentWidget = ({ data, loading, size }: EquipmentWidgetProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const equipmentToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Équipements récents</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/equipment')}
        >
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-2">
        {equipmentToShow.map((equipment) => (
          <EquipmentCard
            key={equipment.id}
            equipment={equipment}
            onClick={() => navigate(`/equipment/${equipment.id}`)}
            compact={size === 'small'}
          />
        ))}
      </div>
    </div>
  );
};
