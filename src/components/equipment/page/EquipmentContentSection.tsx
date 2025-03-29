
import React, { useCallback } from 'react';
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

  // Use useCallback to prevent recreating functions on each render
  const openAddDialog = useCallback(() => {
    console.log('Triggering add equipment dialog');
    const event = new CustomEvent('open-add-equipment-dialog');
    window.dispatchEvent(event);
  }, []);

  const handleEquipmentItemClick = useCallback((item: EquipmentItem) => {
    console.log('Equipment item clicked:', item);
    
    // Safely dispatch custom event
    try {
      const event = new CustomEvent('equipment-selected', { 
        detail: { ...item } // Clone the item to avoid reference issues
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching equipment-selected event:', error);
    }
    
    // Call the passed handler
    handleEquipmentClick(item);
  }, [handleEquipmentClick]);

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
          key="grid-view"
          equipment={filteredEquipment}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          handleEquipmentClick={handleEquipmentItemClick}
        />
      ) : (
        <EquipmentList 
          key="list-view"
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

export default React.memo(EquipmentContentSection);
