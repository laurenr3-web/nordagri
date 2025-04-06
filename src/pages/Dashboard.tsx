
import React, { useState, useEffect } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import Dashboard from '@/components/index/Dashboard';
import CalendarView from '@/components/index/CalendarView';
import AllAlertsSection from '@/components/index/AllAlertsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { 
  adaptStatsData, 
  adaptEquipmentData, 
  adaptMaintenanceEvents, 
  adaptAlertItems, 
  adaptUpcomingTasks 
} from '@/hooks/dashboard/adapters';
import { useNavigate } from 'react-router-dom';
import { SuccessAnimation } from '@/components/ui/success-animation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDashboardPreferences } from '@/hooks/dashboard/useDashboardPreferences';

const DashboardPage = () => {
  // Récupération des données réelles avec le hook
  const { 
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    urgentInterventions,
    stockAlerts,
    weeklyCalendarEvents
  } = useDashboardData();

  // État pour l'animation de succès lors de la personnalisation
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedDashboardItem, setSelectedDashboardItem] = useState<any | null>(null);

  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const navigate = useNavigate();
  const { preferences } = useDashboardPreferences();

  // Adapt data for components
  const adaptedStatsData = loading ? [] : adaptStatsData(statsData);
  const adaptedEquipmentData = loading ? [] : adaptEquipmentData(equipmentData);
  const adaptedMaintenanceEvents = loading ? [] : adaptMaintenanceEvents(maintenanceEvents);
  const adaptedAlertItems = loading ? [] : adaptAlertItems(alertItems);
  const adaptedTasks = loading ? [] : adaptUpcomingTasks(upcomingTasks);

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

  // Handlers for different actions
  const handleEquipmentViewAllClick = () => navigate('/equipment');
  const handleMaintenanceCalendarClick = () => navigate('/maintenance');
  const handleAlertsViewAllClick = () => setCurrentView('alerts');
  const handleTasksAddClick = () => navigate('/maintenance');
  const handleEquipmentClick = (id: number) => {
    // Show details in the right panel instead of navigating
    setSelectedDashboardItem({
      type: 'equipment',
      id,
      data: adaptedEquipmentData.find((item) => item.id === id)
    });
  };

  // Fonction pour montrer l'animation de succès lors de la personnalisation du dashboard
  const showDashboardCustomizationSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);
  };

  // Create the right panel content based on the selected item
  const renderRightPanel = () => {
    if (!selectedDashboardItem) return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Sélectionnez un élément pour voir ses détails</p>
      </div>
    );

    switch (selectedDashboardItem.type) {
      case 'equipment':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{selectedDashboardItem.data?.name}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Type</h3>
                <p>{selectedDashboardItem.data?.type}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">État</h3>
                <p>{selectedDashboardItem.data?.status}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Dernière maintenance</h3>
                <p>{selectedDashboardItem.data?.lastMaintenance?.toLocaleDateString() || 'Non disponible'}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout 
      rightPanel={renderRightPanel()}
      breadcrumbs={[
        { label: 'Accueil', path: '/' },
        { label: 'Tableau de bord', path: '/dashboard' },
      ]}
    >
      <div className="flex-1">
        <div className="px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <Header 
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
            
            <Tabs value={currentView} className="space-y-4">
              <TabsContent value="main">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Card className="w-full max-w-md p-6">
                      <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-center text-muted-foreground">
                          Chargement de votre tableau de bord personnalisé...
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-180px)]">
                    <Dashboard 
                      statsData={adaptedStatsData}
                      equipmentData={adaptedEquipmentData}
                      maintenanceEvents={adaptedMaintenanceEvents}
                      alertItems={adaptedAlertItems}
                      upcomingTasks={adaptedTasks}
                      urgentInterventions={urgentInterventions || []}
                      stockAlerts={stockAlerts || []}
                      weeklyCalendarEvents={weeklyCalendarEvents || []}
                      currentMonth={currentMonth}
                      handleStatsCardClick={handleStatsCardClick}
                      handleEquipmentViewAllClick={handleEquipmentViewAllClick}
                      handleMaintenanceCalendarClick={handleMaintenanceCalendarClick}
                      handleAlertsViewAllClick={handleAlertsViewAllClick}
                      handleTasksAddClick={handleTasksAddClick}
                      handleEquipmentClick={handleEquipmentClick}
                    />
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="calendar">
                <CalendarView 
                  events={adaptedMaintenanceEvents} 
                  month={currentMonth} 
                />
              </TabsContent>
              
              <TabsContent value="alerts">
                <AllAlertsSection alerts={adaptedAlertItems} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Animation de succès pour la personnalisation du tableau de bord */}
      <SuccessAnimation 
        show={showSuccessAnimation} 
        message="Tableau de bord personnalisé" 
      />
    </MainLayout>
  );
};

export default DashboardPage;
