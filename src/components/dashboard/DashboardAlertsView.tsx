
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { AlertsWidget } from '@/components/dashboard/widgets/AlertsWidget';

interface DashboardAlertsViewProps {
  data: Record<string, any>;
  loading: Record<string, boolean>;
}

export const DashboardAlertsView: React.FC<DashboardAlertsViewProps> = ({
  data,
  loading
}) => {
  return (
    <TabsContent value="alerts" className="mt-0">
      <AlertsWidget 
        data={data?.alerts} 
        loading={loading?.alerts || false}
        size="full"
        view="detailed"
      />
    </TabsContent>
  );
};
