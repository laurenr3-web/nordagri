
import React from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Dashboard from './Dashboard';
import CalendarView from './CalendarView';
import AllAlertsSection from './AllAlertsSection';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ViewManagerProps {
  currentView: 'main' | 'calendar' | 'alerts';
  currentMonth: Date;
}

const ViewManager: React.FC<ViewManagerProps> = ({ currentView, currentMonth }) => {
  // Utiliser le hook useDashboardData pour récupérer les données réelles
  const { 
    loading, 
    statsData, 
    equipmentData, 
    maintenanceEvents, 
    alertItems, 
    upcomingTasks,
    error 
  } = useDashboardData();

  // Fonction pour gérer les clics sur les cartes de statistiques
  const handleStatsCardClick = (type: string) => {
    // Implémenter la redirection avec Link plus tard si nécessaire
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
      <TabsContent value="main">
        <Dashboard 
          statsData={statsData}
          equipmentData={equipmentData}
          maintenanceEvents={maintenanceEvents}
          alertItems={alertItems}
          upcomingTasks={upcomingTasks}
          currentMonth={currentMonth}
          handleStatsCardClick={handleStatsCardClick}
          handleEquipmentViewAllClick={() => {}}  
          handleMaintenanceCalendarClick={() => {}}
          handleAlertsViewAllClick={() => {}}
          handleTasksAddClick={() => {}}
          handleEquipmentClick={(id) => {}}
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
