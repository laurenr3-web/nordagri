
import React, { useState } from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';

const Index = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');

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
              
              <ViewManager 
                currentView={currentView} 
                currentMonth={currentMonth} 
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
