
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatisticsHeader from './StatisticsHeader';
import HoursSummaryCards from './HoursSummaryCards';
import EquipmentUsageChart from './EquipmentUsageChart';
import EmployeeWorkHoursChart from './EmployeeWorkHoursChart';
import { TimeBreakdownChart } from '../TimeBreakdownChart';
import { useTimeBreakdown } from '@/hooks/time-tracking/useTimeBreakdown';
import { addMonths, subMonths } from 'date-fns';
import { TimeDistributionChart } from '../rapport/TimeDistributionChart';
import { useTaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { ChartContainer } from '@/components/ui/chart';

const TimeTrackingStatisticsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { data: timeBreakdownData, isLoading: isLoadingBreakdown } = useTimeBreakdown();
  const { distribution, isLoading: isLoadingDistribution } = useTaskTypeDistribution(selectedMonth);

  const handlePreviousMonth = () => {
    setSelectedMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prevMonth => addMonths(prevMonth, 1));
  };

  return (
    <div className="space-y-8">
      <StatisticsHeader 
        selectedMonth={selectedMonth} 
        onPreviousMonth={handlePreviousMonth} 
        onNextMonth={handleNextMonth} 
      />
      
      <HoursSummaryCards selectedMonth={selectedMonth} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Répartition du temps par type de tâche</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <TimeBreakdownChart 
              data={timeBreakdownData} 
              isLoading={isLoadingBreakdown} 
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Utilisation des équipements</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentUsageChart month={selectedMonth} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Temps de travail par technicien</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeWorkHoursChart month={selectedMonth} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Distribution par type de tâche</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <TimeDistributionChart 
              data={distribution} 
              isLoading={isLoadingDistribution} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeTrackingStatisticsPage;
