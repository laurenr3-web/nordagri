
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, CalendarDays, BadgeCheck, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MaintenanceFiltersProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOptions: { label: string; value: string }[];
  userName?: string;
}

export const MaintenanceFilters: React.FC<MaintenanceFiltersProps> = ({
  currentView,
  setCurrentView,
  filterValue,
  setFilterValue,
  searchQuery,
  setSearchQuery,
  filterOptions,
  userName = 'Utilisateur'
}) => {
  const views = [
    { key: 'upcoming', label: 'À venir', icon: Calendar },
    { key: 'today', label: "Aujourd'hui", icon: Clock },
    { key: 'overdue', label: 'En retard', icon: AlertTriangle },
    { key: 'completed', label: 'Terminées', icon: BadgeCheck },
    { key: 'calendar', label: 'Calendrier', icon: CalendarDays },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Rechercher une tâche..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:flex-1"
        />
        
        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {views.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={currentView === key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView(key)}
            className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-1 text-[10px] sm:text-xs sm:flex-row sm:gap-1.5 sm:py-2 sm:px-3"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="leading-tight text-center">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
