
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import Header from '@/components/index/Header';
import ViewManager from '@/components/index/ViewManager';

const Index = () => {
  // Current month for calendar
  const [currentMonth] = useState(new Date());
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'alerts'>('main');

  const handleViewChange = (view: 'main' | 'calendar' | 'alerts') => {
    setCurrentView(view);
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="max-w-full h-full flex flex-col">
            <Header 
              currentView={currentView}
              setCurrentView={handleViewChange}
              className="px-6 py-4 border-b"
            />
            
            <ViewManager 
              currentView={currentView} 
              currentMonth={currentMonth}
              className="flex-1 overflow-auto"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
