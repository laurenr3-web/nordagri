
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  ArrowRight,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';

interface InterventionsNavigationProps {
  setCurrentView: (view: string) => void;
  currentView: string;
}

const InterventionsNavigation: React.FC<InterventionsNavigationProps> = ({ 
  setCurrentView,
  currentView
}) => {
  const navigationItems = [
    {
      title: 'Interventions Planifiées',
      description: 'Voir les interventions à venir',
      icon: <CalendarDays className="h-5 w-5" />,
      view: 'scheduled',
    },
    {
      title: 'Suivi Terrain',
      description: 'Interventions en cours',
      icon: <Wrench className="h-5 w-5" />,
      view: 'field-tracking',
    },
    {
      title: 'Demandes',
      description: 'Gestion des requêtes',
      icon: <FileText className="h-5 w-5" />,
      view: 'requests',
    },
    {
      title: 'Historique',
      description: 'Par équipement',
      icon: <History className="h-5 w-5" />,
      view: 'history',
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
              currentView === item.view ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              {item.icon}
            </div>
            <div className="ml-4 w-full">
              <h3 className="font-semibold text-base truncate">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 truncate">{item.description}</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`${currentView === item.view ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              <span className="truncate">Voir</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InterventionsNavigation;
