
import React, { useMemo, useCallback } from 'react';
import StatsSection from './StatsSection';
import EquipmentSection from './EquipmentSection';
import MaintenanceSection from './MaintenanceSection';
import AlertsSection from './AlertsSection';
import TasksSection from './TasksSection';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { UrgentInterventionsTable } from '@/components/dashboard/UrgentInterventionsTable';
import { StockAlerts } from '@/components/dashboard/StockAlerts';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EnhancedDashboardProps {
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

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
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
  const navigate = useNavigate();
  
  // Mémoisation des éléments de recherche pour éviter des recalculs inutiles
  const searchItems = useMemo(() => [
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
    ...stockAlerts.map(item => ({
      id: item.id,
      title: item.name,
      subtitle: `Stock: ${item.currentStock}/${item.reorderPoint}`,
      type: 'part' as const,
      url: `/parts?id=${item.id}`
    })),
    ...upcomingTasks.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.description,
      type: 'task' as const,
      url: `/maintenance?taskId=${item.id}`
    }))
  ], [equipmentData, urgentInterventions, stockAlerts, upcomingTasks]);

  // Optimisation des gestionnaires d'événements avec useCallback
  const handleViewIntervention = useCallback((id: number) => {
    navigate(`/interventions?id=${id}`);
  }, [navigate]);

  const handleViewParts = useCallback(() => {
    navigate('/parts');
  }, [navigate]);

  const handleViewCalendarEvent = useCallback((id: string | number, type: string) => {
    switch (type) {
      case 'maintenance':
      case 'task':
        navigate(`/maintenance?taskId=${id}`);
        break;
      case 'intervention':
        navigate(`/interventions?id=${id}`);
        break;
      default:
        break;
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold mb-0">Tableau de bord</h1>
        <SearchBar searchItems={searchItems} className="w-[300px]" />
      </div>

      <StatsSection stats={statsData} onStatClick={handleStatsCardClick} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-auto">
        <div className="lg:col-span-2 space-y-4">
          <EquipmentSection 
            equipment={equipmentData} 
            onViewAllClick={handleEquipmentViewAllClick}
            onEquipmentClick={handleEquipmentClick}
          />

          <DashboardSection 
            title="Interventions urgentes" 
            subtitle="Interventions critiques en attente"
            action={
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewIntervention.bind(null, -1)}
                aria-label="Voir toutes les interventions"
              >
                Toutes les interventions
              </Button>
            }
          >
            <UrgentInterventionsTable 
              interventions={urgentInterventions} 
              onViewDetails={handleViewIntervention} 
            />
          </DashboardSection>
          
          <DashboardSection
            title="Calendrier de la semaine"
            subtitle="Vos rendez-vous à venir"
          >
            <WeeklyCalendar 
              events={weeklyCalendarEvents} 
              onViewEvent={handleViewCalendarEvent}
            />
          </DashboardSection>
        </div>
        
        <div className="space-y-4 h-full">
          <AlertsSection 
            alerts={alertItems} 
            onViewAllClick={handleAlertsViewAllClick} 
          />

          <DashboardSection
            title="Stock faible"
            subtitle="Pièces à réapprovisionner"
            action={
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewParts}
                aria-label="Gérer le stock de pièces"
              >
                Gérer le stock
              </Button>
            }
          >
            <StockAlerts alerts={stockAlerts} onViewParts={handleViewParts} />
          </DashboardSection>
          
          <TasksSection 
            tasks={upcomingTasks} 
            onAddClick={handleTasksAddClick} 
          />
        </div>
      </div>
    </div>
  );
};

// Optimiser les re-renders avec React.memo
export default React.memo(EnhancedDashboard);
