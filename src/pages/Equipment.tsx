
import React from "react";
import MainLayout from "@/ui/layouts/MainLayout";
import { useTranslation } from "react-i18next";
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';

const Equipment = () => {
  const { t } = useTranslation();
  const { equipment, isLoading } = useEquipmentData();

  return (
    <MainLayout>
      <div className="w-full max-w-screen-xl mx-auto px-6 lg:px-12" style={{ overflowX: "hidden" }}>
        <EquipmentPageContent 
          equipment={equipment || []} 
          isLoading={isLoading} 
        />
      </div>
    </MainLayout>
  );
};
export default Equipment;
