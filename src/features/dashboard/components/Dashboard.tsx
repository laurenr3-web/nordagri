
import React from 'react';
import { DashboardStats } from './DashboardStats';
import { DashboardCalendar } from './DashboardCalendar';
import { DashboardAlerts } from './DashboardAlerts';
import { DashboardStock } from './DashboardStock';
import { DashboardUrgentInterventions } from './DashboardUrgentInterventions';
import { useLocalStorage } from 'react-use';

// Utilisez cet import pour stocker les préférences de dashboard
interface DashboardLayout {
  [key: string]: {
    visible: boolean;
    order: number;
  };
}

export interface DashboardProps {
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
  // État pour gérer le mode d'édition
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Récupérer la disposition du tableau de bord depuis le stockage local
  const [dashboardLayout, setDashboardLayout] = useLocalStorage<DashboardLayout>('dashboard-layout', {
    'stats': { visible: true, order: 1 },
    'equipment': { visible: true, order: 2 },
    'weekly-calendar': { visible: true, order: 3 },
    'alerts': { visible: true, order: 4 },
    'tasks': { visible: true, order: 5 },
    'urgent-interventions': { visible: true, order: 6 },
    'stock': { visible: true, order: 7 }
  });
  
  // Fonction pour activer/désactiver le mode d'édition
  const toggleEditMode = () => {
    setIsEditing(prev => !prev);
  };
  
  // Fonction pour sauvegarder la disposition
  const saveLayout = (newLayout: DashboardLayout) => {
    setDashboardLayout(newLayout);
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      {/* En-tête du Dashboard avec contrôles */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          onClick={toggleEditMode}
        >
          {isEditing ? "Terminer l'édition" : "Personnaliser"}
        </button>
      </div>
      
      {/* Section des Statistiques */}
      {dashboardLayout?.stats?.visible && (
        <DashboardStats 
          statsData={statsData}
          isEditing={isEditing}
          onStatsCardClick={handleStatsCardClick}
        />
      )}
      
      {/* Section des Alertes */}
      {dashboardLayout?.alerts?.visible && (
        <DashboardAlerts 
          alerts={alertItems}
          isEditing={isEditing}
          onViewAll={handleAlertsViewAllClick}
        />
      )}
      
      {/* Section du Calendrier Hebdomadaire */}
      {dashboardLayout?.['weekly-calendar']?.visible && (
        <DashboardCalendar
          events={weeklyCalendarEvents}
          isEditing={isEditing}
          onViewEvent={(id, type) => console.log('View event:', id, type)}
        />
      )}
      
      {/* Section des Interventions Urgentes */}
      {dashboardLayout?.['urgent-interventions']?.visible && (
        <DashboardUrgentInterventions 
          interventions={urgentInterventions}
          isEditing={isEditing}
          onViewAll={() => console.log('View all interventions')}
          onViewDetails={(id) => console.log('View intervention details:', id)}
        />
      )}
      
      {/* Section des Alertes de Stock */}
      {dashboardLayout?.stock?.visible && (
        <DashboardStock 
          alerts={stockAlerts}
          isEditing={isEditing}
          onViewParts={() => console.log('View parts')}
        />
      )}
    </div>
  );
};

export default Dashboard;
