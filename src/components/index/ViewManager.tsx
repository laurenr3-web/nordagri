
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Dashboard from './Dashboard';
import CalendarView from './CalendarView';
import AllAlertsSection from './AllAlertsSection';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { 
  adaptStatsData, 
  adaptEquipmentData, 
  adaptMaintenanceEvents, 
  adaptAlertItems, 
  adaptUpcomingTasks 
} from '@/hooks/dashboard/adapters';

interface ViewManagerProps {
  currentView: 'main' | 'calendar' | 'alerts';
  currentMonth: Date;
}

const ViewManager: React.FC<ViewManagerProps> = ({ currentView, currentMonth }) => {
  const navigate = useNavigate();
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

  // Adapt data for UI components
  const adaptedStatsData = adaptStatsData(statsData);
  const adaptedEquipmentData = adaptEquipmentData(equipmentData);
  const adaptedMaintenanceEvents = adaptMaintenanceEvents(maintenanceEvents);
  const adaptedAlertItems = adaptAlertItems(alertItems);
  const adaptedUpcomingTasks = adaptUpcomingTasks(upcomingTasks);

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

  const handleTasksAddClick = () => {
    navigate('/maintenance');
  };
  
  const handleEquipmentClick = (id: number) => {
    navigate(`/equipment/${id}`);
  };

  const handleAlertsViewAllClick = () => {
    // Do nothing - this is handled by the parent
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard data...</div>;
  }

  return (
    <Tabs value={currentView} className="space-y-8">
      <TabsContent value="main">
        <Dashboard 
          statsData={adaptedStatsData}
          equipmentData={adaptedEquipmentData}
          maintenanceEvents={adaptedMaintenanceEvents}
          alertItems={adaptedAlertItems}
          upcomingTasks={adaptedUpcomingTasks}
          currentMonth={currentMonth}
          urgentInterventions={urgentInterventions}
          stockAlerts={stockAlerts}
          weeklyCalendarEvents={weeklyCalendarEvents}
          handleStatsCardClick={handleStatsCardClick}
          handleEquipmentViewAllClick={handleEquipmentViewAllClick}
          handleMaintenanceCalendarClick={handleMaintenanceCalendarClick}
          handleAlertsViewAllClick={handleAlertsViewAllClick}
          handleTasksAddClick={handleTasksAddClick}
          handleEquipmentClick={handleEquipmentClick}
        />
      </TabsContent>
      
      <TabsContent value="calendar">
        <CalendarView 
          events={adaptedMaintenanceEvents} 
          month={currentMonth} 
        />
      </TabsContent>
      
      <TabsContent value="alerts">
        <AllAlertsSection alerts={adaptedAlertItems} />
      </TabsContent>
    </Tabs>
  );
};

export default ViewManager;
