
import React from 'react';
import SearchInput from './toolbar/SearchInput';
import FilterDropdownMenu from './toolbar/FilterDropdownMenu';
import SortDropdownMenu from './toolbar/SortDropdownMenu';
import { EquipmentDensityToggle, DensityMode, ViewMode } from '../display/EquipmentDensityToggle';
import { ImageExportManager } from '../images/ImageExportManager';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EnhancedSearchToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
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
  equipment: EquipmentItem[];
}

export const EnhancedSearchToolbar: React.FC<EnhancedSearchToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView,
  density,
  setDensity,
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
  setSortOrder,
  equipment
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <SearchInput 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        
        {/* Filter Dropdown */}
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
        
        {/* Sort Dropdown */}
        <SortDropdownMenu
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
        />
        
        <div className="flex items-center gap-2">
          {/* View and Density Toggle */}
          <EquipmentDensityToggle
            currentView={currentView}
            onViewChange={setCurrentView}
            density={density}
            onDensityChange={setDensity}
          />
          
          {/* Export Manager */}
          <ImageExportManager equipment={equipment} />
        </div>
      </div>
    </div>
  );
};
