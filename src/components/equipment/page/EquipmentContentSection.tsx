
import React from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentHeader from '../display/EquipmentHeader';
import SearchToolbar from '../filter/SearchToolbar';
import CategoryTabs from '../display/CategoryTabs';
import EquipmentGrid from '../display/EquipmentGrid';
import EquipmentList from '../display/EquipmentList';
import NoEquipmentFound from '../display/NoEquipmentFound';
import { getStatusColor, getStatusText } from '../utils/statusUtils';

interface EquipmentContentSectionProps {
  equipment: EquipmentItem[];
  isLoading: boolean;
  filterState: any;
  viewState: {
    currentView: string;
    setCurrentView: (view: string) => void;
  };
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

// Définir explicitement les props pour SearchToolbar
interface SearchToolbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  filters: any;
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
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const EquipmentContentSection: React.FC<EquipmentContentSectionProps> = ({
  equipment,
  isLoading,
  filterState,
  viewState,
  handleEquipmentClick
}) => {
  const { currentView, setCurrentView } = viewState;
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filters,
    statusOptions,
    typeOptions,
    manufacturerOptions,
    yearOptions,
    toggleFilter,
    isFilterActive,
    clearFilters,
    resetAllFilters,
    activeFilterCount,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredEquipment
  } = filterState;

  const openAddDialog = () => {
    console.log('Triggering add equipment dialog');
    const event = new CustomEvent('open-add-equipment-dialog');
    window.dispatchEvent(event);
  };

  const handleEquipmentItemClick = (item: EquipmentItem) => {
    console.log('Equipment item clicked:', item);
    // Dispatch custom event to open the equipment details dialog
    const event = new CustomEvent('equipment-selected', { detail: item });
    window.dispatchEvent(event);
    
    // Also call the passed handler
    handleEquipmentClick(item);
  };

  return (
    <>
      <EquipmentHeader openAddDialog={openAddDialog} />
      
      <SearchToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
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
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
      />
      
      <CategoryTabs 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : currentView === 'grid' ? (
        <EquipmentGrid
          equipment={filteredEquipment}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          handleEquipmentClick={handleEquipmentItemClick}
        />
      ) : (
        <EquipmentList 
          equipment={filteredEquipment}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          handleEquipmentClick={handleEquipmentItemClick}
        />
      )}
      
      {!isLoading && filteredEquipment.length === 0 && (
        <NoEquipmentFound resetFilters={resetAllFilters} />
      )}
    </>
  );
};

export default EquipmentContentSection;
