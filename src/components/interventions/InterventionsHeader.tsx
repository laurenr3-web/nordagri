
import React, { useState } from 'react';
import { Download, Filter, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface InterventionsHeaderProps {
  onNewIntervention: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handlePriorityToggle = (priority: string) => {
    if (selectedPriority === priority) {
      onPriorityChange(null);
    } else {
      onPriorityChange(priority);
    }
  };

  return (
    <div className="border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 space-y-1.5">
          <h1 className="text-lg font-semibold">Interventions</h1>
          <p className="text-sm text-muted-foreground">
            Gérez et suivez les interventions de maintenance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {selectedPriority && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Priorité</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="priority-high" 
                        checked={selectedPriority === 'high'} 
                        onCheckedChange={() => handlePriorityToggle('high')}
                      />
                      <Label htmlFor="priority-high">Haute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="priority-medium" 
                        checked={selectedPriority === 'medium'} 
                        onCheckedChange={() => handlePriorityToggle('medium')}
                      />
                      <Label htmlFor="priority-medium">Moyenne</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="priority-low" 
                        checked={selectedPriority === 'low'} 
                        onCheckedChange={() => handlePriorityToggle('low')}
                      />
                      <Label htmlFor="priority-low">Basse</Label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button size="sm" onClick={onNewIntervention}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Intervention
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterventionsHeader;
