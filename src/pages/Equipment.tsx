
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import EquipmentDialogs from '@/components/equipment/dialogs/EquipmentDialogs';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { useEquipmentRealtime } from '@/hooks/equipment/useEquipmentRealtime';
import { toast } from 'sonner';

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
  
  return (
    <SidebarProvider>
      <EquipmentPageContent 
        equipment={equipment || []}
        isLoading={isLoading}
      />
      <EquipmentDialogs />
    </SidebarProvider>
  );
};

export default EquipmentPage;
