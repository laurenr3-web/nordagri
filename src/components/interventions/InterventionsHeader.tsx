
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, List, MapPin, FileText, Plus, Filter, Eye, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface InterventionsHeaderProps {
  onNewIntervention: () => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    <div className="border-b mb-6">
      <div className="container py-4 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Rechercher une intervention..." 
                className="w-full pl-8" 
                value={searchQuery} 
                onChange={onSearchChange}
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
                  Planifiées
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('in-progress')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  En cours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('field-tracking')}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Suivi terrain
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('observations')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Observations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView && setCurrentView('requests')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Demandes
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionsHeader;
