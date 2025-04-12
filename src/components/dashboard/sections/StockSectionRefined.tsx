
import React from 'react';
import { DashboardSection } from './DashboardSection';
import { StockAlerts } from '@/components/dashboard/StockAlerts';
import { StockAlert } from '@/hooks/dashboard/types/dashboardTypes';

interface StockSectionRefinedProps {
  alerts: StockAlert[];
  isEditing: boolean;
  onViewParts: () => void;
}

export const StockSectionRefined: React.FC<StockSectionRefinedProps> = ({
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
