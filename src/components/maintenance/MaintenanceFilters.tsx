
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
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les maintenances de vos équipements, {userName}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Rechercher une tâche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto min-w-[200px]"
          />
          
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-full sm:w-auto">
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
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentView === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('upcoming')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          <span>À venir</span>
        </Button>
        
        <Button
          variant={currentView === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('today')}
        >
          <Clock className="h-4 w-4 mr-2" />
          <span>Aujourd'hui</span>
          <Badge variant="secondary" className="ml-1">
            {/* Count of today's tasks would go here */}
          </Badge>
        </Button>
        
        <Button
          variant={currentView === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('overdue')}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>En retard</span>
        </Button>
        
        <Button
          variant={currentView === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('completed')}
        >
          <BadgeCheck className="h-4 w-4 mr-2" />
          <span>Terminées</span>
        </Button>
        
        <Button
          variant={currentView === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('calendar')}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          <span>Calendrier</span>
        </Button>
      </div>
    </div>
  );
};
