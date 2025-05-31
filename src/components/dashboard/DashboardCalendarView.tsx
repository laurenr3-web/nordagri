
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { CalendarWidget } from '@/components/dashboard/widgets/CalendarWidget';

interface DashboardCalendarViewProps {
  data: Record<string, any>;
  loading: Record<string, boolean>;
}

export const DashboardCalendarView: React.FC<DashboardCalendarViewProps> = ({
  data,
  loading
}) => {
  return (
    <TabsContent value="calendar" className="mt-0">
      <CalendarWidget 
        data={data?.calendar} 
        loading={loading?.calendar || false}
        size="full"
        view="month"
      />
    </TabsContent>
  );
};
