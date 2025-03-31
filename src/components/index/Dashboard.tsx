
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

const Dashboard: React.FC<DashboardProps> = (props) => {
  return (
    <EnhancedDashboard {...props} />
  );
};

export default Dashboard;
