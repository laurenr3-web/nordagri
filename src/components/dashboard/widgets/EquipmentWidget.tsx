
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
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gradient-to-r from-agri-100 to-agri-200 rounded-xl"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-agri-100 rounded w-3/4"></div>
              <div className="h-3 bg-agri-50 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const equipmentToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-agri-900">Équipements récents</h3>
          <p className="text-sm text-agri-600 mt-1">Vue d'ensemble de votre flotte</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/equipment')}
          className="border-agri-200 text-agri-700 hover:bg-agri-50 hover:border-agri-300 transition-all duration-200"
        >
          Voir tout
        </Button>
      </div>
      
      <div className="space-y-4">
        {equipmentToShow.map((item) => (
          <EquipmentCard
            key={item.id}
            name={item.name}
            type={item.type}
            status={item.status}
            image={item.image}
            onClick={() => navigate(`/equipment/${item.id}`)}
            className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 bg-gradient-to-br from-white to-agri-50"
          />
        ))}
      </div>
    </div>
  );
};
