
import React, { useMemo } from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import type { Equipment } from '@/services/supabase/equipmentService';
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { PageHeader } from "@/components/layout/PageHeader";

const Equipment = () => {
  const { t } = useTranslation();
  const { equipment, isLoading } = useEquipmentData();

  // Transform Equipment objects to EquipmentItem objects
  const transformedEquipment = useMemo(() => {
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
      image: item.image || '',
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate 
        ? (typeof item.purchaseDate === 'object' 
           ? item.purchaseDate.toISOString() 
           : String(item.purchaseDate))
        : '',
      // Add the required properties that EquipmentItem needs
      usage: { 
        hours: item.valeur_actuelle || 0, 
        target: 500 // Default value
      }, 
      nextService: { 
        type: 'Regular maintenance', 
        due: 'In 30 days' 
      }
    }));
  }, [equipment]);

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Équipements" 
          description="Gérez votre parc matériel et son état"
        />
        <EquipmentPageContent 
          equipment={transformedEquipment} 
          isLoading={isLoading} 
        />
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Equipment;
