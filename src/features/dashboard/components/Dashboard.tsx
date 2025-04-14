
import React, { memo, useMemo } from 'react';
import DashboardContent from './DashboardContent';
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
import { SearchItem } from '@/types/search';

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
  // Create search items from various data sources
  const searchItems = useMemo(() => {
    const items: SearchItem[] = [
      ...equipmentData.map(item => ({
        id: item.id,
        title: item.name,
        subtitle: item.type,
        type: 'equipment' as const,
        url: `/equipment/${item.id}`
      })),
      ...urgentInterventions.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.equipment,
        type: 'intervention' as const,
        url: `/interventions?id=${item.id}`
      })),
      ...(stockAlerts?.map(item => ({
        id: item.id,
        title: item.name,
        subtitle: `Stock: ${item.currentStock}/${item.reorderPoint}`,
        type: 'part' as const,
        url: `/parts?id=${item.id}`
      })) || []),
      ...upcomingTasks.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.description,
        type: 'task' as const,
        url: `/maintenance?taskId=${item.id}`
      }))
    ];
    return items;
  }, [equipmentData, urgentInterventions, stockAlerts, upcomingTasks]);

  return (
    <DashboardContent 
      statsData={statsData}
      equipmentData={equipmentData}
      maintenanceEvents={maintenanceEvents}
      alertItems={alertItems}
      upcomingTasks={upcomingTasks}
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
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
