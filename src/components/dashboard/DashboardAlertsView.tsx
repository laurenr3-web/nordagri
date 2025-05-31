
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { AlertsWidget } from '@/components/dashboard/widgets/AlertsWidget';

interface DashboardAlertsViewProps {
  data: any;
  loading: boolean;
}

export const DashboardAlertsView: React.FC<DashboardAlertsViewProps> = ({
  data,
  loading
}) => {
  return (
    <TabsContent value="alerts" className="mt-0">
      <AlertsWidget 
        data={data?.alerts} 
        loading={loading?.alerts}
        size="full"
        view="detailed"
      />
    </TabsContent>
  );
};
