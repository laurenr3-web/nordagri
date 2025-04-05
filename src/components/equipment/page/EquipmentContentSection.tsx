
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
    <div className="flex flex-col h-full">
      <EquipmentHeader openAddDialog={openAddDialog} />
      
      <div className="mb-3">
        <SearchToolbar
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
      
      <div className="mb-3">
        <CategoryTabs 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
      
      <div className="flex-1 min-h-0 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Conditionally render the appropriate view, with list view coming first */}
            {currentView === 'list' ? (
              <EquipmentList 
                equipment={filteredEquipment}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                handleEquipmentClick={handleEquipmentItemClick}
              />
            ) : (
              <EquipmentGrid
                equipment={filteredEquipment}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                handleEquipmentClick={handleEquipmentItemClick}
              />
            )}
          </>
        )}
        
        {!isLoading && filteredEquipment.length === 0 && (
          <NoEquipmentFound resetFilters={resetAllFilters} />
        )}
      </div>
    </div>
  );
};

export default EquipmentContentSection;
