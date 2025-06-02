
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { EquipmentCard } from '@/components/dashboard/EquipmentCard';
import { ArrowRight } from 'lucide-react';

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
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-agri-50 to-agri-100 rounded-xl">
              <div className="w-8 h-8 bg-agri-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-agri-200 rounded w-3/4"></div>
                <div className="h-3 bg-agri-150 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Limite stricte à 2 équipements pour un affichage compact
  const displayLimit = 2;
  const equipmentToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-agri-900">Équipements</h3>
          <p className="text-sm text-agri-600 mt-1">État de votre flotte</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/equipment')}
          className="border-agri-200 text-agri-700 hover:bg-agri-50 hover:border-agri-300 transition-all duration-200 flex items-center gap-2"
        >
          <span>Voir tout</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {equipmentToShow.map((item) => (
          <EquipmentCard
            key={item.id}
            name={item.name}
            type={item.type}
            status={item.status}
            image={item.image}
            nextService={item.nextService}
            onClick={() => navigate(`/equipment/${item.id}`)}
            compact={true}
            className="transition-all duration-300 hover:bg-gradient-to-r hover:from-agri-25 hover:to-agri-50"
          />
        ))}
      </div>

      {equipmentToShow.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-agri-100 to-agri-200 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-agri-400 rounded"></div>
          </div>
          <p className="text-agri-600 font-medium text-sm">Aucun équipement</p>
          <p className="text-xs text-agri-500 mt-1">Ajoutez votre premier équipement</p>
        </div>
      )}

      {data && data.length > displayLimit && (
        <div className="pt-2">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/equipment')}
            className="w-full text-agri-600 hover:text-agri-700 hover:bg-agri-50 text-sm"
          >
            +{data.length - displayLimit} autres équipements
          </Button>
        </div>
      )}
    </div>
  );
};
