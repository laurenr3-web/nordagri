
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CalendarDays, 
  Clock, 
  AlertOctagon, 
  Wrench, 
  ArrowRight 
} from 'lucide-react';

interface MaintenanceNavigationProps {
  setCurrentView: (view: string) => void;
  currentView: string;
}

const MaintenanceNavigation: React.FC<MaintenanceNavigationProps> = ({ 
  setCurrentView,
  currentView
}) => {
  const navigationItems = [
    {
      title: 'Upcoming Maintenance',
      description: 'View all scheduled maintenance tasks',
      icon: <CalendarDays className="h-5 w-5" />,
      view: 'upcoming',
    },
    {
      title: 'Maintenance by Type',
      description: 'View tasks grouped by maintenance type',
      icon: <Wrench className="h-5 w-5" />,
      view: 'by-type',
    },
    {
      title: 'Maintenance by Priority',
      description: 'View tasks grouped by priority level',
      icon: <AlertOctagon className="h-5 w-5" />,
      view: 'by-priority',
    },
    {
      title: 'Calendar View',
      description: 'View tasks on a monthly calendar',
      icon: <Clock className="h-5 w-5" />,
      view: 'calendar',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {navigationItems.map((item) => (
        <Card 
          key={item.view}
          className={`p-4 cursor-pointer hover:shadow-md transition-shadow border ${
            currentView === item.view ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => setCurrentView(item.view)}
        >
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              currentView === item.view ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${currentView === item.view ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <span>View</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MaintenanceNavigation;
