
import React from 'react';
import { Link } from 'react-router-dom';
import StatsSection from './StatsSection';
import EquipmentSection from './EquipmentSection';
import MaintenanceSection from './MaintenanceSection';
import AlertsSection from './AlertsSection';
import TasksSection from './TasksSection';
import { Stat, EquipmentItem, MaintenanceEvent, AlertItem, TaskItem } from '@/hooks/dashboard/useDashboardData';

interface DashboardProps {
  statsData: Stat[];
  equipmentData: EquipmentItem[];
  maintenanceEvents: MaintenanceEvent[];
  alertItems: AlertItem[];
  upcomingTasks: TaskItem[];
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Equipment</h2>
            <Link to="/equipment" className="text-primary text-sm">
              View All
            </Link>
          </div>
          <EquipmentSection 
            equipment={equipmentData} 
            onViewAllClick={handleEquipmentViewAllClick}
            onEquipmentClick={handleEquipmentClick}
          />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Maintenance</h2>
            <Link to="/maintenance" className="text-primary text-sm">
              View Calendar
            </Link>
          </div>
          <MaintenanceSection 
            events={maintenanceEvents} 
            month={currentMonth} 
            onCalendarClick={handleMaintenanceCalendarClick} 
          />
        </div>
        
        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Alerts</h2>
            <Link to="/?view=alerts" className="text-primary text-sm">
              View All
            </Link>
          </div>
          <AlertsSection 
            alerts={alertItems} 
            onViewAllClick={handleAlertsViewAllClick} 
          />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Link to="/maintenance" className="text-primary text-sm">
              Add
            </Link>
          </div>
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
