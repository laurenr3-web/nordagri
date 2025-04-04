
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import EquipmentDialogs from '@/components/equipment/dialogs/EquipmentDialogs';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { useEquipmentRealtime } from '@/hooks/equipment/useEquipmentRealtime';
import { toast } from 'sonner';
import { Equipment } from '@/services/supabase/equipment/types';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

const EquipmentPage = () => {
  // Use the equipment data hook to fetch and manage equipment
  const {
    equipment,
    isLoading,
    error
  } = useEquipmentData();
  
  // Set up realtime updates
  const { isSubscribed } = useEquipmentRealtime();
  
  // Afficher une erreur si le chargement des données échoue
  React.useEffect(() => {
    if (error) {
      console.error('Error loading equipment data:', error);
      toast.error('Erreur de chargement des données', {
        description: error.message || 'Impossible de charger les équipements'
      });
    }
  }, [error]);

  // Afficher un message de succès lors de la connexion aux mises à jour en temps réel
  React.useEffect(() => {
    if (isSubscribed) {
      console.log('Successfully subscribed to equipment updates');
    }
  }, [isSubscribed]);
  
  // Transformer les équipements en EquipmentItem
  const transformedEquipment: EquipmentItem[] = React.useMemo(() => {
    if (!equipment) return [];
    
    return equipment.map((item: Equipment) => ({
      id: item.id,
      name: item.name,
      type: item.type || 'Unknown',
      category: item.category || 'Uncategorized',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      year: item.year || 0,
      status: item.status || 'unknown',
      location: item.location || '',
      lastMaintenance: 'N/A',
      image: item.image || '',
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate 
        ? (typeof item.purchaseDate === 'object' 
           ? item.purchaseDate.toISOString() 
           : String(item.purchaseDate))
        : '',
      usage: { hours: 0, target: 500 },
      nextService: { type: 'Regular maintenance', due: 'In 30 days' }
    }));
  }, [equipment]);
  
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="h-full">
            <div className="p-4">
              <h1 className="text-2xl font-semibold">Équipements</h1>
            </div>
            <EquipmentPageContent 
              equipment={transformedEquipment}
              isLoading={isLoading}
            />
            <EquipmentDialogs />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EquipmentPage;
