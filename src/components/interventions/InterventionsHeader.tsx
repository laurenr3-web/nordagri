
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
    <div className="border-b mb-2">
      <div className="container py-2 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Rechercher une intervention..." 
                className="w-full pl-8" 
                value={searchQuery} 
                onChange={onSearchChange}
              />
            </div>
            
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filtrer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionsHeader;
