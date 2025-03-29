
import React from 'react';
import { Link } from 'react-router-dom';
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Équipements</h2>
            <Link to="/equipment" className="text-primary text-sm">
              Voir tout
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
              Voir calendrier
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
            <h2 className="text-xl font-semibold">Alertes</h2>
            <Link to="/?view=alerts" className="text-primary text-sm">
              Voir tout
            </Link>
          </div>
          <AlertsSection 
            alerts={alertItems} 
            onViewAllClick={handleAlertsViewAllClick} 
          />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tâches</h2>
            <Link to="/maintenance" className="text-primary text-sm">
              Ajouter
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
