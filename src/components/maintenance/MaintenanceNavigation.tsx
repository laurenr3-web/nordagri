
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ListTodo, AlertTriangle, BarChart4 } from 'lucide-react';

interface MaintenanceNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobile?: boolean;
}

const MaintenanceNavigation: React.FC<MaintenanceNavigationProps> = ({ 
  currentView, 
  setCurrentView,
  isMobile = false
}) => {
  return (
    <div className="w-full mb-8">
      <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
        <TabsList className={`w-full flex ${isMobile ? 'flex-wrap gap-2' : 'justify-start'} border-b rounded-none p-0 h-auto bg-transparent`}>
          <TabsTrigger 
            value="upcoming" 
            className={`${isMobile ? 'flex-1' : 'min-w-[140px]'} py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
          >
            <ListTodo className="mr-2 h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="by-type" 
            className={`${isMobile ? 'flex-1' : 'min-w-[140px]'} py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
          >
            <BarChart4 className="mr-2 h-4 w-4" />
            By Type
          </TabsTrigger>
          <TabsTrigger 
            value="by-priority" 
            className={`${isMobile ? 'flex-1' : 'min-w-[140px]'} py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            By Priority
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className={`${isMobile ? 'flex-1' : 'min-w-[140px]'} py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MaintenanceNavigation;
