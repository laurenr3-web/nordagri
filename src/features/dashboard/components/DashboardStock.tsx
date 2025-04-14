
import React from 'react';
import { DashboardSection } from '@/components/dashboard/sections/DashboardSection';
import { StockAlerts } from '@/components/dashboard/StockAlerts';
import { StockAlert } from '@/hooks/dashboard/types/dashboardTypes';

interface DashboardStockProps {
  alerts: StockAlert[];
  isEditing: boolean;
  onViewParts: () => void;
}

export const DashboardStock: React.FC<DashboardStockProps> = ({
  alerts,
  isEditing,
  onViewParts
}) => {
  return (
    <DashboardSection
      id="stock"
      title="Stock faible"
      subtitle="Pièces à réapprovisionner"
      isEditing={isEditing}
      actionLabel="Gérer le stock"
      onAction={onViewParts}
    >
      <StockAlerts alerts={alerts} onViewParts={onViewParts} />
    </DashboardSection>
  );
};
