
import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatisticsHeader } from './StatisticsHeader';
import { EmployeeWorkHoursChart } from './EmployeeWorkHoursChart';
import { EquipmentUsageChart } from './EquipmentUsageChart';
import { HoursSummaryCards } from './HoursSummaryCards';
import { useTimeStatistics } from '@/hooks/time-tracking/useTimeStatistics';

const TimeTrackingStatisticsPage: React.FC = () => {
  const { 
    employeeStats,
    equipmentStats,
    hoursSummary,
    isLoading, 
    timeRange,
    setTimeRange
  } = useTimeStatistics();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 overflow-y-auto">
          <div className="container py-6">
            <div className="mb-6">
              <Link to="/time-tracking">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au suivi du temps
                </Button>
              </Link>
              
              <StatisticsHeader 
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </div>
            
            <HoursSummaryCards 
              summary={hoursSummary} 
              isLoading={isLoading} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="p-6">
                <EmployeeWorkHoursChart 
                  data={employeeStats} 
                  isLoading={isLoading} 
                />
              </Card>
              
              <Card className="p-6">
                <EquipmentUsageChart 
                  data={equipmentStats} 
                  isLoading={isLoading} 
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TimeTrackingStatisticsPage;
