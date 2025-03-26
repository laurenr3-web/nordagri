
import React from 'react';
import StatsSection from './StatsSection';
import EquipmentSection from './EquipmentSection';
import MaintenanceSection from './MaintenanceSection';
import AlertsSection from './AlertsSection';
import TasksSection from './TasksSection';

interface DashboardProps {
  statsData: any[];
  equipmentData: any[];
  maintenanceEvents: any[];
  alertItems: any[];
  upcomingTasks: any[];
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
  currentMonth,
  handleStatsCardClick,
  handleEquipmentViewAllClick,
  handleMaintenanceCalendarClick,
  handleAlertsViewAllClick,
  handleTasksAddClick,
  handleEquipmentClick
}) => {
  return (
    <div className="space-y-8">
      <StatsSection stats={statsData} onStatClick={handleStatsCardClick} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EquipmentSection 
            equipment={equipmentData} 
            onViewAllClick={handleEquipmentViewAllClick}
            onEquipmentClick={handleEquipmentClick}
          />
          
          <MaintenanceSection 
            events={maintenanceEvents} 
            month={currentMonth} 
            onCalendarClick={handleMaintenanceCalendarClick} 
          />
        </div>
        
        <div className="space-y-8">
          <AlertsSection 
            alerts={alertItems} 
            onViewAllClick={handleAlertsViewAllClick} 
          />
          
          <TasksSection 
            tasks={upcomingTasks} 
            onAddClick={handleTasksAddClick} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
