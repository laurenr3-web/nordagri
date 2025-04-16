
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
    error,
    refetch
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
  // et forcer un rafraîchissement des données
  React.useEffect(() => {
    if (isSubscribed) {
      console.log('Successfully subscribed to equipment updates');
      // Forcer un rafraîchissement des données lorsqu'on est abonné aux mises à jour
      refetch();
    }
  }, [isSubscribed, refetch]);
  
  // Forcer un rafraîchissement périodique des données (toutes les 30 secondes)
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('Periodic equipment data refresh');
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
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
      <EquipmentPageContent 
        equipment={transformedEquipment}
        isLoading={isLoading}
      />
      <EquipmentDialogs />
    </MainLayout>
  );
};

export default EquipmentPage;
