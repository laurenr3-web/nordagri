
import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import EquipmentDialogs from '@/components/equipment/dialogs/EquipmentDialogs';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { useEquipmentRealtime } from '@/hooks/equipment/useEquipmentRealtime';
import { toast } from 'sonner';

const EquipmentPage = () => {
  // Use a ref to track component mount status
  const isMounted = useRef(true);
  
  // Use the equipment data hook to fetch and manage equipment
  const {
    equipment,
    isLoading,
    error
  } = useEquipmentData();
  
  // Set up realtime updates with cleanup function
  const realtime = useEquipmentRealtime();
  
  // Afficher une erreur si le chargement des données échoue
  useEffect(() => {
    if (error && isMounted.current) {
      console.error('Error loading equipment data:', error);
      toast.error('Erreur de chargement des données', {
        description: error.message || 'Impossible de charger les équipements'
      });
    }
  }, [error]);
  
  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
      console.log('Equipment page unmounted');
    };
  }, []);
  
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
