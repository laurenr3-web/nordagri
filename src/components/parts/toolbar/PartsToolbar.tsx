
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { BlurContainer } from '@/components/ui/blur-container';

interface PartsToolbarProps {
  view: PartsView;
  setView: (view: PartsView) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCount: number;
  onFilterClick: () => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  totalParts: number;
  filteredParts: number;
}

export const PartsToolbar: React.FC<PartsToolbarProps> = ({
  view,
  setView,
  searchTerm,
  setSearchTerm,
  filterCount,
  onFilterClick,
  sortBy,
  setSortBy,
  selectedCount = 0,
  onDeleteSelected,
  totalParts,
  filteredParts
}) => {
  // Save view preference when changed
  const handleViewChange = (newView: PartsView) => {
    setView(newView);
    localStorage.setItem('partsViewPreference', newView);
  };

  return (
    <BlurContainer className="p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Rechercher par nom, référence, fabricant..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount > 0 && onDeleteSelected && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onDeleteSelected}
              className="gap-1"
            >
              Supprimer ({selectedCount})
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="gap-2" 
            size="sm"
            onClick={onFilterClick}
          >
            <Filter size={16} />
            <span>Filtrer</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {filterCount}
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            size="sm"
            onClick={() => {
              const nextSort = sortBy === 'name-asc' ? 'name-desc' : 'name-asc';
              setSortBy(nextSort);
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Trier</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={view === 'grid' ? 'bg-secondary' : ''} 
            onClick={() => handleViewChange('grid')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H6.5V6.5H2V2ZM2 8.5H6.5V13H2V8.5ZM8.5 2H13V6.5H8.5V2ZM8.5 8.5H13V13H8.5V8.5Z" fill="currentColor"/>
            </svg>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={view === 'list' ? 'bg-secondary' : ''}
            onClick={() => handleViewChange('list')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3H13V5H2V3ZM2 7H13V9H2V7ZM2 11H13V13H2V11Z" fill="currentColor"/>
            </svg>
          </Button>
        </div>
      </div>
      
      {totalParts > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {filteredParts} {filteredParts > 1 ? 'pièces' : 'pièce'} 
          {filterCount > 0 && ` (filtré${filteredParts > 1 ? 's' : ''})`} sur {totalParts}
        </div>
      )}
    </BlurContainer>
  );
};
