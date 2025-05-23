
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { useFarmId } from '@/hooks/useFarmId';
import NoFarmAccess from '@/components/common/NoFarmAccess';
import LoadingState from '@/components/common/LoadingState';
import { logger } from '@/utils/logger';

interface ViewManagerProps {
  currentView: 'main' | 'calendar' | 'alerts';
  currentMonth: Date;
}

const ViewManager: React.FC<ViewManagerProps> = ({ currentView, currentMonth }) => {
  const navigate = useNavigate();
  const { farmId, isLoading: farmLoading, noAccess } = useFarmId();
  
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

  // Handlers for navigation
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

  if (farmLoading || loading) {
    return <LoadingState message="Chargement des données du tableau de bord..." />;
  }

  // If the user doesn't have access to a farm, display the NoFarmAccess component
  if (noAccess) {
    return <NoFarmAccess />;
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
