
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, FilterIcon, SortAsc } from 'lucide-react';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
import PartDetailsExtended from './PartDetailsExtended';
import { Part } from '@/types/Part';

interface PartsContainerProps {
  parts: Part[];
  filteredParts: Part[];
  selectedPart: Part | null;
  handleSelectPart: (part: Part | null) => void;
  handleAddPart: (part: Part) => void;
  handleUpdatePart: (part: Part) => void;
  handleDeletePart: (partId: string | number) => void;
  handleFilterChange: (filter: string) => void;
  handleSearchChange: (search: string) => void;
  handleSortChange: (sort: string) => void;
  handleViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsFilterDialogOpen: (open: boolean) => void;
  setIsSortDialogOpen: (open: boolean) => void;
}

const PartsContainer: React.FC<PartsContainerProps> = ({
  parts,
  filteredParts,
  selectedPart,
  handleSelectPart,
  handleAddPart,
  handleUpdatePart,
  handleDeletePart,
  handleFilterChange,
  handleSearchChange,
  handleSortChange,
  handleViewModeChange,
  viewMode,
  isAddDialogOpen,
  setIsAddDialogOpen,
  setIsFilterDialogOpen,
  setIsSortDialogOpen,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearchChange(value);
  };

  if (selectedPart) {
    return (
      <PartDetailsExtended
        part={selectedPart}
        onClose={() => handleSelectPart(null)}
        onEdit={handleUpdatePart}
        onOrder={(part) => console.log('Order part:', part)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Rechercher une pièce..."
              className="w-full rounded-md border border-input px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchValue}
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
            value={viewMode}
            onValueChange={(value) => handleViewModeChange(value as 'grid' | 'list')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Affichage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grille</SelectItem>
              <SelectItem value="list">Liste</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <PartsGrid parts={filteredParts} onSelectPart={handleSelectPart} />
      ) : (
        <PartsList parts={filteredParts} onSelectPart={handleSelectPart} />
      )}
    </div>
  );
};

export default PartsContainer;
