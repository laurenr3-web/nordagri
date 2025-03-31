
import React from 'react';
import EnhancedDashboard from './EnhancedDashboard';

interface DashboardProps {
  statsData: any[];
  equipmentData: any[];
  maintenanceEvents: any[];
  alertItems: any[];
  upcomingTasks: any[];
  urgentInterventions: any[];
  stockAlerts: any[];
  weeklyCalendarEvents: any[];
  currentMonth: Date;
  handleStatsCardClick: (type: string) => void;
  handleEquipmentViewAllClick: () => void;
  handleMaintenanceCalendarClick: () => void;
  handleAlertsViewAllClick: () => void;
  handleTasksAddClick: () => void;
  handleEquipmentClick: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
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
};

export default Dashboard;
