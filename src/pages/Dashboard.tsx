
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import Dashboard from '@/components/index/Dashboard';
import CalendarView from '@/components/index/CalendarView';
import AllAlertsSection from '@/components/index/AllAlertsSection';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { 
  adaptStatsData, 
  adaptEquipmentData, 
  adaptMaintenanceEvents, 
  adaptAlertItems, 
  adaptUpcomingTasks 
} from '@/hooks/dashboard/adapters';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  // Récupération des données réelles avec le hook
  const { 
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    urgentInterventions,
    stockAlerts,
    weeklyCalendarEvents
  } = useDashboardData();

  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const navigate = useNavigate();

  // Adapt data for components
  const adaptedStatsData = loading ? [] : adaptStatsData(statsData);
  const adaptedEquipmentData = loading ? [] : adaptEquipmentData(equipmentData);
  const adaptedMaintenanceEvents = loading ? [] : adaptMaintenanceEvents(maintenanceEvents);
  const adaptedAlertItems = loading ? [] : adaptAlertItems(alertItems);
  const adaptedTasks = loading ? [] : adaptUpcomingTasks(upcomingTasks);

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'Active Equipment':
        navigate('/equipment');
        break;
      case 'Maintenance Tasks':
        navigate('/maintenance');
        break;
      case 'Parts Inventory':
        navigate('/parts');
        break;
      case 'Field Interventions':
        navigate('/interventions');
        break;
    }
  };

  const handleEquipmentViewAllClick = () => {
    navigate('/equipment');
  };

  const handleMaintenanceCalendarClick = () => {
    navigate('/maintenance');
  };

  const handleAlertsViewAllClick = () => {
    setCurrentView('alerts');
  };

  const handleTasksAddClick = () => {
    navigate('/maintenance');
  };
  
  const handleEquipmentClick = (id: number) => {
    navigate(`/equipment/${id}`);
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col">
        <div className="p-4 flex-1">
          <div className="max-w-full mx-auto h-full">
            <Header 
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
            
            <Tabs value={currentView} className="h-full flex flex-col">
              <TabsContent value="main" className="flex-1 h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Dashboard 
                    statsData={adaptedStatsData}
                    equipmentData={adaptedEquipmentData}
                    maintenanceEvents={adaptedMaintenanceEvents}
                    alertItems={adaptedAlertItems}
                    upcomingTasks={adaptedTasks}
                    urgentInterventions={urgentInterventions || []}
                    stockAlerts={stockAlerts || []}
                    weeklyCalendarEvents={weeklyCalendarEvents || []}
                    currentMonth={currentMonth}
                    handleStatsCardClick={handleStatsCardClick}
                    handleEquipmentViewAllClick={handleEquipmentViewAllClick}
                    handleMaintenanceCalendarClick={handleMaintenanceCalendarClick}
                    handleAlertsViewAllClick={handleAlertsViewAllClick}
                    handleTasksAddClick={handleTasksAddClick}
                    handleEquipmentClick={handleEquipmentClick}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="calendar" className="flex-1 h-full">
                <CalendarView 
                  events={adaptedMaintenanceEvents} 
                  month={currentMonth} 
                />
              </TabsContent>
              
              <TabsContent value="alerts" className="flex-1 h-full">
                <AllAlertsSection alerts={adaptedAlertItems} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
