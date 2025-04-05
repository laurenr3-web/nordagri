
import React from 'react';
import SearchInput from './toolbar/SearchInput';
import FilterDropdownMenu from './toolbar/FilterDropdownMenu';
import SortDropdownMenu from './toolbar/SortDropdownMenu';
import ViewToggle from './toolbar/ViewToggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  filters: any;
  statusOptions: string[];
  typeOptions: string[];
  manufacturerOptions: string[];
  yearOptions: { min: number; max: number };
  isFilterActive: (type: string, value: string) => boolean;
  toggleFilter: (type: string, value: string) => void;
  clearFilters: (type?: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeFilterCount: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView,
  filters,
  statusOptions,
  typeOptions,
  manufacturerOptions,
  yearOptions,
  isFilterActive,
  toggleFilter,
  clearFilters,
  getStatusColor,
  getStatusText,
  activeFilterCount,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Conteneur pour les contrôles primaires (pleine largeur sur mobile) */}
      <div className={`flex ${isMobile ? 'w-full flex-col' : 'flex-row'} gap-2`}>
        {/* La recherche prend le plus d'espace */}
        <div className={`${isMobile ? 'w-full' : 'flex-grow'}`}>
          <SearchInput 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        </div>
      
        {/* Conteneur pour les contrôles secondaires */}
        <div className={`flex ${isMobile ? 'w-full justify-between' : 'ml-auto'} gap-2`}>
          {/* Sur mobile: les filtres et le tri sont plus importants que le toggle de vue */}
          <div className="flex gap-2">
            <FilterDropdownMenu
              filters={filters}
              statusOptions={statusOptions}
              typeOptions={typeOptions}
              manufacturerOptions={manufacturerOptions}
              yearOptions={yearOptions}
              isFilterActive={isFilterActive}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              activeFilterCount={activeFilterCount}
            />
            
            <SortDropdownMenu
              sortBy={sortBy}
              sortOrder={sortOrder}
              setSortBy={setSortBy}
              setSortOrder={setSortOrder}
            />
          </div>
          
          {/* Le toggle de vue est moins important */}
          <ViewToggle 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
          />
        </div>
      </div>
      
      {/* Affichage des filtres actifs */}
      {activeFilterCount > 0 && (
        <div className="w-full flex items-center mt-2">
          <div className="text-sm text-muted-foreground flex items-center">
            <span className="mr-2">Filtres actifs: {activeFilterCount}</span>
            <button 
              onClick={() => clearFilters()} 
              className="text-primary hover:underline text-xs"
              aria-label="Effacer tous les filtres"
            >
              Effacer tout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchToolbar;
