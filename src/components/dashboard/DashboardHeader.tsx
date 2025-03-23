
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, CalendarClock, AlertTriangle } from 'lucide-react';

interface DashboardHeaderProps {
  currentView: 'main' | 'calendar' | 'alerts';
  setCurrentView: (view: 'main' | 'calendar' | 'alerts') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="chip chip-primary mb-2">Agricultural ERP Dashboard</div>
          <h1 className="text-3xl font-medium tracking-tight mb-1">Welcome Back</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your agricultural equipment today
          </p>
        </div>
        
        <Tabs value={currentView} onValueChange={value => setCurrentView(value as 'main' | 'calendar' | 'alerts')} className="mt-4 sm:mt-0">
          <TabsList className="grid w-full grid-cols-3 md:w-auto mx-auto">
            <TabsTrigger value="main" className="gap-2">
              <LayoutDashboard size={16} />
              <span className="px-[23px]">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarClock size={16} />
              <span>June 2023</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle size={16} />
              <span>Alerts</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default DashboardHeader;
