
import React, { memo } from 'react';
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
import { useNavigationHandlers } from '@/hooks/useNavigationHandlers';
import type { AlertItem } from '@/hooks/dashboard/types/dashboardTypes';

interface ViewManagerProps {
  currentView: 'main' | 'calendar' | 'alerts';
  currentMonth: Date;
}

const ViewManager: React.FC<ViewManagerProps> = memo(({ currentView, currentMonth }) => {
  // Use our custom navigation handlers hook
  const navigationHandlers = useNavigationHandlers();
  
  // Destructure the dashboard data
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

  // Adapt data for UI components (memoize these adapters in their hooks for better performance)
  const adaptedStatsData = adaptStatsData(statsData);
  const adaptedEquipmentData = adaptEquipmentData(equipmentData);
  const adaptedMaintenanceEvents = adaptMaintenanceEvents(maintenanceEvents);
  const adaptedAlertItems = adaptAlertItems(alertItems);
  const adaptedUpcomingTasks = adaptUpcomingTasks(upcomingTasks);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données du tableau de bord...</p>
        </div>
      </div>
    );
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
          urgentInterventions={urgentInterventions}
          stockAlerts={stockAlerts}
          weeklyCalendarEvents={weeklyCalendarEvents}
          currentMonth={currentMonth}
          handleStatsCardClick={navigationHandlers.handleStatsCardClick}
          handleEquipmentViewAllClick={navigationHandlers.handleEquipmentViewAllClick}
          handleMaintenanceCalendarClick={navigationHandlers.handleMaintenanceCalendarClick}
          handleAlertsViewAllClick={() => {}} // This is handled by the parent component
          handleTasksAddClick={navigationHandlers.handleTasksAddClick}
          handleEquipmentClick={navigationHandlers.handleEquipmentClick}
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
});

ViewManager.displayName = 'ViewManager';

export default ViewManager;
