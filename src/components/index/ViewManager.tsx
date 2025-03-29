
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Dashboard from './Dashboard';
import CalendarView from './CalendarView';
import AllAlertsSection from './AllAlertsSection';
import { 
  statsData, 
  equipmentData, 
  maintenanceEvents, 
  alertItems, 
  upcomingTasks 
} from '@/data/dashboardData';

interface ViewManagerProps {
  currentView: 'main' | 'calendar' | 'alerts';
  currentMonth: Date;
}

const ViewManager: React.FC<ViewManagerProps> = ({ currentView, currentMonth }) => {
  // Remplacer l'utilisation de navigate par des liens directs
  const handleStatsCardClick = (type: string) => {
    // This function will be kept but handled by links instead of navigation
  };

  return (
    <Tabs value={currentView} className="space-y-8">
      <TabsContent value="main">
        <Dashboard 
          statsData={statsData}
          equipmentData={equipmentData}
          maintenanceEvents={maintenanceEvents}
          alertItems={alertItems}
          upcomingTasks={upcomingTasks}
          currentMonth={currentMonth}
          handleStatsCardClick={handleStatsCardClick}
          handleEquipmentViewAllClick={() => {}}  
          handleMaintenanceCalendarClick={() => {}}
          handleAlertsViewAllClick={() => {}}
          handleTasksAddClick={() => {}}
          handleEquipmentClick={(id) => {}}
        />
      </TabsContent>
      
      <TabsContent value="calendar">
        <CalendarView 
          events={maintenanceEvents} 
          month={currentMonth} 
        />
      </TabsContent>
      
      <TabsContent value="alerts">
        <AllAlertsSection alerts={alertItems.concat(alertItems.map(alert => ({...alert, id: alert.id + 100})))} />
      </TabsContent>
    </Tabs>
  );
};

export default ViewManager;
