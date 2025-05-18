
import React from 'react';
import { Calendar, Clock, Wrench, MapPin, FileText, Eye } from 'lucide-react';

interface InterventionTabsProps {
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  currentView: string;
  onTabClick: (path: string | undefined) => void;
}

const InterventionTabs: React.FC<InterventionTabsProps> = ({
  scheduledCount,
  inProgressCount,
  completedCount,
  currentView,
  onTabClick
}) => {
  const tabs = [
    {
      id: 'scheduled',
      label: 'Planifiées',
      icon: <Calendar className="w-5 h-5 mr-2" />,
      count: scheduledCount
    },
    {
      id: 'in-progress',
      label: 'En cours',
      icon: <Clock className="w-5 h-5 mr-2" />,
      count: inProgressCount
    },
    {
      id: 'completed',
      label: 'Terminées',
      icon: <Wrench className="w-5 h-5 mr-2" />,
      count: completedCount
    },
    {
      id: 'field-tracking',
      label: 'Suivi terrain',
      icon: <MapPin className="w-5 h-5 mr-2" />,
      count: null
    },
    {
      id: 'requests',
      label: 'Demandes',
      icon: <FileText className="w-5 h-5 mr-2" />,
      count: null
    },
    {
      id: 'observations',
      label: 'Observations',
      icon: <Eye className="w-5 h-5 mr-2" />,
      count: null
    }
  ];

  return (
    <div className="overflow-x-auto mb-6">
      <div className="flex space-x-1 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
              ${currentView === tab.id 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs 
                ${currentView === tab.id 
                  ? 'bg-primary-foreground text-primary' 
                  : 'bg-muted-foreground/20'
                }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InterventionTabs;
