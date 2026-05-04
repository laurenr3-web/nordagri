
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/ui/layouts/MainLayout';
import TimeTrackingStatisticsPage from '@/components/time-tracking/statistics/TimeTrackingStatisticsPage';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OperationalOverview from '@/components/statistics/OperationalOverview';
import TaskHoursTab from '@/components/time-tracking/statistics/TaskHoursTab';
import type { StatsPeriod } from '@/hooks/statistics/useOperationalStats';
import { TAB_ROUTES, isValidTab, resolveTab } from '@/config/tabRoutes';

const TimeTrackingStatistics = () => {
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(resolveTab('timeStatistics', searchParams.get('tab')));

  useEffect(() => {
    const t = searchParams.get('tab');
    if (isValidTab('timeStatistics', t) && t !== activeTab) setActiveTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    const next = new URLSearchParams(searchParams);
    if (v === TAB_ROUTES.timeStatistics.defaultTab) next.delete('tab');
    else next.set('tab', v);
    setSearchParams(next, { replace: true });
  };

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader
          title="Statistiques"
          description="Vue d'ensemble du travail, des points à surveiller et de la réactivité"
        />
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 gap-1 h-auto">
            <TabsTrigger value="overview" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5 whitespace-normal leading-tight text-center">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="hours" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5 whitespace-normal leading-tight text-center">
              Heures des tâches
            </TabsTrigger>
            <TabsTrigger value="time" className="text-[11px] sm:text-sm px-1 sm:px-3 py-1.5 whitespace-normal leading-tight text-center">
              Temps de travail
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <OperationalOverview period={period} onPeriodChange={setPeriod} />
          </TabsContent>
          <TabsContent value="hours" className="mt-6">
            <TaskHoursTab />
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
