
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CalendarDays, 
  Wrench, 
  ArrowRight,
  ListChecks,
  Calendar,
  AlertTriangle
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
      description: 'View scheduled tasks and deadlines',
      icon: <ListChecks className="h-5 w-5" />,
      view: 'upcoming',
    },
    {
      title: 'Maintenance Types',
      description: 'Browse tasks by category and type',
      icon: <Wrench className="h-5 w-5" />,
      view: 'by-type',
    },
    {
      title: 'Priority Tasks',
      description: 'Focus on critical and urgent work',
      icon: <AlertTriangle className="h-5 w-5" />,
      view: 'by-priority',
    },
    {
      title: 'Calendar View',
      description: 'Plan your maintenance schedule',
      icon: <Calendar className="h-5 w-5" />,
      view: 'calendar',
    },
  ];

  const handleCardClick = (view: string) => {
    setCurrentView(view);
    // Set the tab selection to match the view
    const tabsElement = document.querySelector(`[value="${view}"]`) as HTMLElement;
    if (tabsElement) {
      tabsElement.click();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {navigationItems.map((item) => (
        <Card 
          key={item.view}
          className={`p-4 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] border ${
            currentView === item.view ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => handleCardClick(item.view)}
        >
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              currentView === item.view ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-base">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${currentView === item.view ? 'text-primary font-medium' : 'text-muted-foreground'}`}
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
