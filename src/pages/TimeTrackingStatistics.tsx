
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import TimeTrackingStatisticsPage from '@/components/time-tracking/statistics/TimeTrackingStatisticsPage';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OperationalOverview from '@/components/statistics/OperationalOverview';
import type { StatsPeriod } from '@/hooks/statistics/useOperationalStats';

const TimeTrackingStatistics = () => {
  const [period, setPeriod] = useState<StatsPeriod>('week');

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader
          title="Statistiques"
          description="Vue d'ensemble du travail, des points à surveiller et de la réactivité"
        />
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="time">Temps de travail</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <OperationalOverview period={period} onPeriodChange={setPeriod} />
          </TabsContent>
          <TabsContent value="time" className="mt-6">
            <TimeTrackingStatisticsPage />
          </TabsContent>
        </Tabs>
      </LayoutWrapper>
    </MainLayout>
  );
};

export default TimeTrackingStatistics;
