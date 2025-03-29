
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';

// Components
import Header from '@/components/index/Header';
import Dashboard from '@/components/index/Dashboard';
import CalendarView from '@/components/index/CalendarView';
import AllAlertsSection from '@/components/index/AllAlertsSection';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

// Custom hook for dashboard data
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

const DashboardPage = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const navigate = useNavigate();

  // Use our custom hook to fetch all dashboard data
  const { 
    loading, 
    statsData, 
    equipmentData, 
    maintenanceEvents, 
    alertItems, 
    upcomingTasks 
  } = useDashboardData();

  // Navigation handlers
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
            <div className="max-w-7xl mx-auto">
              <Header 
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
              
              {loading ? (
                <LoadingSpinner message="Loading dashboard data..." />
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
