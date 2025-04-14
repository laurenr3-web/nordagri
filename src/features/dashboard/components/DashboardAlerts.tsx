
import React from 'react';
import { DashboardSection } from '@/components/dashboard/sections/DashboardSection';

interface AlertItem {
  id: number;
  title: string;
  message: string;
}

interface DashboardAlertsProps {
  alerts: AlertItem[];
  isEditing: boolean;
  onViewAll: () => void;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({
  alerts,
  isEditing,
  onViewAll
}) => {
  return (
    <DashboardSection
      id="alerts"
      title="Alertes"
      subtitle="Notifications importantes"
      isEditing={isEditing}
      actionLabel="Voir tout"
      onAction={onViewAll}
    >
      <div className="space-y-4">
        {alerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className="border rounded-md p-3">
            <h4 className="font-medium">{alert.title}</h4>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
};
