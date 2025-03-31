
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, List, MapPin, FileText, Plus, Filter } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModeToggle } from '../ui/mode-toggle';

interface InterventionsHeaderProps {
  onNewIntervention: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
  currentView?: string;
  setCurrentView?: (view: string) => void;
}

const InterventionsHeader: React.FC<InterventionsHeaderProps> = ({
  onNewIntervention,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  currentView,
  setCurrentView
}) => {
  return (
    <header className="border-b">
      <div className="container py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interventions</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les interventions techniques et les maintenances sur le terrain
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onNewIntervention}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle intervention
            </Button>
            <ModeToggle />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filtrer</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="px-2 py-1.5 text-sm font-semibold">Priorité</div>
                <DropdownMenuItem 
                  className={!selectedPriority ? "bg-accent" : ""}
                  onClick={() => onPriorityChange(null)}
                >
                  Toutes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={selectedPriority === 'high' ? "bg-accent" : ""}
                  onClick={() => onPriorityChange('high')}
                >
                  Haute
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={selectedPriority === 'medium' ? "bg-accent" : ""}
                  onClick={() => onPriorityChange('medium')}
                >
                  Moyenne
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={selectedPriority === 'low' ? "bg-accent" : ""}
                  onClick={() => onPriorityChange('low')}
                >
                  Basse
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm font-semibold">Affichage</div>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('scheduled')}>
                  <List className="h-4 w-4 mr-2" />
                  Liste
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('calendar')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendrier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('field-tracking')}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Suivi terrain
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('requests')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Demandes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {setCurrentView && (
            <Tabs 
              value={currentView || 'scheduled'} 
              className="w-full sm:w-auto"
              onValueChange={setCurrentView}
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="scheduled" className="flex items-center">
                  <List className="h-4 w-4 mr-2 hidden sm:block" />
                  Liste
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 hidden sm:block" />
                  Calendrier
                </TabsTrigger>
                <TabsTrigger value="field-tracking" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 hidden sm:block" />
                  Suivi
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 hidden sm:block" />
                  Demandes
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>
    </header>
  );
};

// Composant Search icon (pour éviter d'importer lucide-react)
const Search = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default InterventionsHeader;
