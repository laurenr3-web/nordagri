
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BlurContainer } from '@/components/ui/blur-container';
import { Search } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import SortDropdown from './SortDropdown';
import ActiveFilters from './ActiveFilters';

interface SearchToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  filters: {
    status?: string[];
    type?: string[];
    manufacturer?: string[];
    year?: number[];
  };
  statusOptions: string[];
  typeOptions: string[];
  manufacturerOptions: string[];
  yearOptions: number[];
  isFilterActive: (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => boolean;
  toggleFilter: (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => void;
  clearFilters: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeFilterCount: number;
  sortBy: string;
  sortOrder: string;
  setSortBy: (value: string) => void;
  setSortOrder: (value: string) => void;
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
  // S'assurer que filters a des valeurs par défaut
  const safeFilters = {
    status: filters.status || [],
    type: filters.type || [],
    manufacturer: filters.manufacturer || [],
    year: filters.year || []
  };

  return (
    <BlurContainer className="p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search equipment, manufacturer, model..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <FilterDropdown
            statusOptions={statusOptions}
            typeOptions={typeOptions}
            manufacturerOptions={manufacturerOptions}
            yearOptions={yearOptions}
            filters={safeFilters}
            activeFilterCount={activeFilterCount}
            isFilterActive={isFilterActive}
            toggleFilter={toggleFilter}
            clearFilters={clearFilters}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
          
          <SortDropdown
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
          />
          
          <Button 
            variant="outline" 
            size="icon" 
            className={currentView === 'grid' ? 'bg-secondary' : ''} 
            onClick={() => setCurrentView('grid')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H6.5V6.5H2V2ZM2 8.5H6.5V13H2V8.5ZM8.5 2H13V6.5H8.5V2ZM8.5 8.5H13V13H8.5V8.5Z" fill="currentColor"/>
            </svg>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={currentView === 'list' ? 'bg-secondary' : ''} 
            onClick={() => setCurrentView('list')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3H13V5H2V3ZM2 7H13V9H2V7ZM2 11H13V13H2V11Z" fill="currentColor"/>
            </svg>
          </Button>
        </div>
      </div>
      
      <ActiveFilters
        filters={safeFilters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeFilterCount={activeFilterCount}
      />
    </BlurContainer>
  );
};

export default SearchToolbar;
