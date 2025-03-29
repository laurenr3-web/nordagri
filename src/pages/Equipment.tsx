import React, { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import EquipmentDialogs from '@/components/equipment/dialogs/EquipmentDialogs';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { useEquipmentRealtime } from '@/hooks/equipment/useEquipmentRealtime';
import { toast } from 'sonner';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';
import { Equipment } from '@/services/supabase/equipmentService';

// Helper function to convert Equipment to EquipmentItem
const mapEquipmentToEquipmentItem = (equipment: Equipment[]): EquipmentItem[] => {
  return equipment.map(item => ({
    id: item.id, // This will accept both number and string
    name: item.name,
    type: item.type || 'Unknown',
    category: item.category || 'Uncategorized',
    manufacturer: item.manufacturer || '',
    model: item.model || '',
    year: item.year || 0,
    status: item.status || 'unknown',
    location: item.location || '',
    lastMaintenance: item.lastMaintenance
      ? (typeof item.lastMaintenance === 'object'
         ? item.lastMaintenance.toISOString()
         : String(item.lastMaintenance))
      : 'N/A',
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
};

const EquipmentPage = () => {
  // Use a ref to track component mount status
  const isMounted = useRef(true);
  
  // Use the equipment data hook to fetch and manage equipment
  const {
    equipment,
    isLoading,
    error
  } = useEquipmentData();
  
  // Convert Equipment[] to EquipmentItem[]
  const equipmentItems = React.useMemo(() => {
    return equipment ? mapEquipmentToEquipmentItem(equipment) : [];
  }, [equipment]);
  
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
        equipment={equipmentItems}
        isLoading={isLoading}
      />
      <EquipmentDialogs />
    </SidebarProvider>
  );
};

export default EquipmentPage;
