
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FilterIcon, SortAsc } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { debounce } from '@/utils/debounce';

interface PartsHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentView: PartsView;
  setCurrentView: (view: PartsView) => void;
  setIsFilterDialogOpen: (open: boolean) => void;
  setIsSortDialogOpen: (open: boolean) => void;
  setIsAddPartDialogOpen: (open: boolean) => void;
}

const PartsHeader: React.FC<PartsHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView,
  setIsFilterDialogOpen,
  setIsSortDialogOpen,
  setIsAddPartDialogOpen
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchTerm);

  // Sync local search value with the parent state
  useEffect(() => {
    setLocalSearchValue(searchTerm);
  }, [searchTerm]);

  // Create a debounced version of setSearchTerm
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    [setSearchTerm]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    debouncedSetSearchTerm(value);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            placeholder="Rechercher une pièce..."
            className="w-full rounded-md border border-input px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={localSearchValue}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsFilterDialogOpen(true)}>
          <FilterIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setIsSortDialogOpen(true)}>
          <SortAsc className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Select
          value={currentView}
          onValueChange={(value) => setCurrentView(value as PartsView)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Affichage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grille</SelectItem>
            <SelectItem value="list">Liste</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddPartDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
    </div>
  );
};

export default PartsHeader;
