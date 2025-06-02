
import React from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentHeader from '../display/EquipmentHeader';
import SearchToolbar from '../filter/SearchToolbar';
import CategoryTabs from '../display/CategoryTabs';
import OptimizedEquipmentGrid from '../display/OptimizedEquipmentGrid';
import OptimizedEquipmentList from '../display/OptimizedEquipmentList';
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
    const event = new CustomEvent('equipment-selected', { detail: item });
    window.dispatchEvent(event);
    handleEquipmentClick(item);
  };

  return (
    <>
      <EquipmentHeader openAddDialog={openAddDialog} />
      
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
      
      <CategoryTabs 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : currentView === 'grid' ? (
        <OptimizedEquipmentGrid
          equipment={filteredEquipment}
          onEquipmentClick={handleEquipmentItemClick}
        />
      ) : (
        <OptimizedEquipmentList 
          equipment={filteredEquipment}
          onEquipmentClick={handleEquipmentItemClick}
        />
      )}
      
      {!isLoading && filteredEquipment.length === 0 && (
        <NoEquipmentFound resetFilters={resetAllFilters} />
      )}
    </>
  );
};

export default EquipmentContentSection;
