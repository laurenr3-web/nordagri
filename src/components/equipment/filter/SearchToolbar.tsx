
import React from 'react';
import SearchInput from './toolbar/SearchInput';
import FilterDropdownMenu from './toolbar/FilterDropdownMenu';
import SortDropdownMenu from './toolbar/SortDropdownMenu';
import ViewToggle from './toolbar/ViewToggle';

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
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Priorité à la recherche - toujours pleine largeur */}
      <div className="w-full">
        <SearchInput 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
      </div>
      
      {/* Conteneur flexible pour les contrôles secondaires */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtres - important */}
        <div className="flex-grow sm:flex-grow-0">
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
        </div>
        
        {/* Tri - moins important */}
        <div>
          <SortDropdownMenu
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
          />
        </div>
        
        {/* Bascule d'affichage */}
        <div className="ml-auto">
          <ViewToggle 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
          />
        </div>
      </div>
    </div>
  );
};

export default SearchToolbar;
