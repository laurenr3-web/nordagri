
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';

interface InterventionsHeaderProps {
  onNewIntervention: () => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
}

const InterventionsHeader: React.FC<InterventionsHeaderProps> = ({
  onNewIntervention,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange
}) => {
  return (
    <div className="border-b mb-4">
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
          
          <Button onClick={onNewIntervention} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle intervention
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterventionsHeader;
