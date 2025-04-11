
import React, { memo } from 'react';
import EnhancedDashboard from './EnhancedDashboard';
import { 
  StatsCardData, 
  EquipmentItem, 
  MaintenanceEvent, 
  AlertItem, 
  UpcomingTask,
  UrgentIntervention,
  StockAlert,
  CalendarEvent
} from '@/hooks/dashboard/types/dashboardTypes';

interface DashboardProps {
  statsData: StatsCardData[];
  equipmentData: EquipmentItem[];
  maintenanceEvents: MaintenanceEvent[];
  alertItems: AlertItem[];
  upcomingTasks: UpcomingTask[];
  urgentInterventions: UrgentIntervention[];
  stockAlerts: StockAlert[];
  weeklyCalendarEvents: CalendarEvent[];
  currentMonth: Date;
  handleStatsCardClick: (type: string) => void;
  handleEquipmentViewAllClick: () => void;
  handleMaintenanceCalendarClick: () => void;
  handleAlertsViewAllClick: () => void;
  handleTasksAddClick: () => void;
  handleEquipmentClick: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = memo(({
  statsData,
  equipmentData,
  maintenanceEvents,
  alertItems,
  upcomingTasks,
  urgentInterventions,
  stockAlerts,
  weeklyCalendarEvents,
  currentMonth,
  handleStatsCardClick,
  handleEquipmentViewAllClick,
  handleMaintenanceCalendarClick,
  handleAlertsViewAllClick,
  handleTasksAddClick,
  handleEquipmentClick
}) => {
  console.log('Dashboard rendering with', statsData.length, 'stat cards');
  
  return (
    <EnhancedDashboard 
      statsData={statsData}
      equipmentData={equipmentData}
      maintenanceEvents={maintenanceEvents}
      alertItems={alertItems}
      upcomingTasks={upcomingTasks}
      urgentInterventions={urgentInterventions}
      stockAlerts={stockAlerts}
      weeklyCalendarEvents={weeklyCalendarEvents}
      currentMonth={currentMonth}
      handleStatsCardClick={handleStatsCardClick}
      handleEquipmentViewAllClick={handleEquipmentViewAllClick}
      handleMaintenanceCalendarClick={handleMaintenanceCalendarClick}
      handleAlertsViewAllClick={handleAlertsViewAllClick}
      handleTasksAddClick={handleTasksAddClick}
      handleEquipmentClick={handleEquipmentClick}
    />
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
