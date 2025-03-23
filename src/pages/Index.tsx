
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MainDashboardView from '@/components/dashboard/views/MainDashboardView';
import CalendarDashboardView from '@/components/dashboard/views/CalendarDashboardView';
import AlertsDashboardView from '@/components/dashboard/views/AlertsDashboardView';

const Index = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
          />
          
          <Tabs value={currentView} className="space-y-8">
            <TabsContent value="main">
              <MainDashboardView currentMonth={currentMonth} />
            </TabsContent>
            
            <TabsContent value="calendar">
              <CalendarDashboardView currentMonth={currentMonth} />
            </TabsContent>
            
            <TabsContent value="alerts">
              <AlertsDashboardView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
