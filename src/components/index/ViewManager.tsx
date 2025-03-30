
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Dashboard from './Dashboard';
import CalendarView from './CalendarView';
import AllAlertsSection from './AllAlertsSection';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";

interface ViewManagerProps {
  currentView: 'main' | 'calendar' | 'alerts';
  currentMonth: Date;
  setCurrentView: (view: 'main' | 'calendar' | 'alerts') => void;
}

const ViewManager: React.FC<ViewManagerProps> = ({ 
  currentView, 
  currentMonth,
  setCurrentView 
}) => {
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  
  // Utiliser le hook pour obtenir les données réelles
  const { 
    loading, 
    statsData, 
    equipmentData, 
    maintenanceEvents, 
    alertItems, 
    upcomingTasks,
    error,
    isOfflineMode
  } = useDashboardData();

  // Gestionnaires de navigation fonctionnels
  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'Active Equipment':
        navigate('/equipment');
        break;
      case 'Maintenance Tasks':
        navigate('/maintenance');
        break;
      case 'Parts Inventory':
        navigate('/parts');
        break;
      case 'Field Interventions':
        navigate('/interventions');
        break;
    }
  };

  const handleEquipmentViewAllClick = () => {
    navigate('/equipment');
  };

  const handleMaintenanceCalendarClick = () => {
    navigate('/maintenance');
  };

  const handleAlertsViewAllClick = () => {
    setCurrentView('alerts');
  };

  const handleTasksAddClick = () => {
    navigate('/maintenance');
  };
  
  const handleEquipmentClick = (id: number) => {
    navigate(`/equipment/${id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des données..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error}. Veuillez réessayer plus tard ou contacter l'assistance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs value={currentView} className="space-y-8">
      {!isOnline && (
        <Alert className="mb-4 border-amber-500">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Mode Hors Ligne</AlertTitle>
          <AlertDescription>
            Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
          </AlertDescription>
        </Alert>
      )}
      
      {isOfflineMode && (
        <Alert className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Mode Hors Ligne</AlertTitle>
          <AlertDescription>
            Utilisation des données de test. La connexion à la base de données n'est pas disponible.
          </AlertDescription>
        </Alert>
      )}
      
      <TabsContent value="main">
        <Dashboard 
          statsData={statsData}
          equipmentData={equipmentData}
          maintenanceEvents={maintenanceEvents}
          alertItems={alertItems}
          upcomingTasks={upcomingTasks}
          currentMonth={currentMonth}
          handleStatsCardClick={handleStatsCardClick}
          handleEquipmentViewAllClick={handleEquipmentViewAllClick}
          handleMaintenanceCalendarClick={handleMaintenanceCalendarClick}
          handleAlertsViewAllClick={handleAlertsViewAllClick}
          handleTasksAddClick={handleTasksAddClick}
          handleEquipmentClick={handleEquipmentClick}
        />
      </TabsContent>
      
      <TabsContent value="calendar">
        <CalendarView 
          events={maintenanceEvents} 
          month={currentMonth} 
        />
      </TabsContent>
      
      <TabsContent value="alerts">
        <AllAlertsSection alerts={alertItems} />
      </TabsContent>
    </Tabs>
  );
};

export default ViewManager;
