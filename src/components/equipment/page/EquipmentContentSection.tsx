
import React, { useCallback } from 'react';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';
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
  
  // Ajouter des valeurs par défaut pour éviter les erreurs undefined
  const {
    filters = { filterStatus: [], filterType: [], filterCategory: [], filterManufacturer: [] },
    filterOptions = { status: [], type: [], category: [], manufacturer: [] },
    filteredEquipment = [],
    setSearchTerm = () => {},
    toggleStatusFilter = () => {},
    toggleTypeFilter = () => {},
    toggleCategoryFilter = () => {},
    toggleManufacturerFilter = () => {},
    setSortBy = () => {},
    resetFilters = () => {},
  } = filterState || {};

  // Adapter les noms de propriétés pour les composants d'interface
  const searchTerm = filters.searchTerm || '';
  const selectedCategory = filters.filterCategory?.[0] || 'all';
  const setSelectedCategory = (category: string) => {
    if (category === 'all') {
      toggleCategoryFilter(filters.filterCategory?.[0] || '');
    } else {
      toggleCategoryFilter(category);
    }
  };
  const statusOptions = filterOptions.status || [];
  const typeOptions = filterOptions.type || [];
  const manufacturerOptions = filterOptions.manufacturer || [];
  const yearOptions = [];  // Non utilisé actuellement

  // Adapter les fonctions de filtrage
  const isFilterActive = (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => {
    if (type === 'status') return filters.filterStatus?.includes(value as string) || false;
    if (type === 'type') return filters.filterType?.includes(value as string) || false;
    if (type === 'manufacturer') return filters.filterManufacturer?.includes(value as string) || false;
    return false;
  };

  const toggleFilter = (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => {
    if (type === 'status') toggleStatusFilter(value as string);
    else if (type === 'type') toggleTypeFilter(value as string);
    else if (type === 'manufacturer') toggleManufacturerFilter(value as string);
  };

  const clearFilters = () => resetFilters();
  const resetAllFilters = () => resetFilters();
  const activeFilterCount = 
    (filters.filterStatus?.length || 0) + 
    (filters.filterType?.length || 0) + 
    (filters.filterCategory?.length || 0) + 
    (filters.filterManufacturer?.length || 0);

  const sortBy = filters.sortBy || 'name';
  const sortOrder = filters.sortOrder || 'asc';

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

  // Utiliser un tableau d'équipements filtré ou le tableau original si filteredEquipment est undefined
  const equipmentToDisplay = Array.isArray(filteredEquipment) && filteredEquipment.length > 0 
    ? filteredEquipment 
    : equipment;

  return (
    <>
      <EquipmentHeader openAddDialog={openAddDialog} />
      
      <SearchToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
        filters={{
          status: filters.filterStatus || [],
          type: filters.filterType || [],
          manufacturer: filters.filterManufacturer || [],
          year: []
        }}
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
        setSortOrder={() => {}}
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
          equipment={equipmentToDisplay}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          handleEquipmentClick={handleEquipmentItemClick}
        />
      ) : (
        <EquipmentList 
          key="list-view"
          equipment={equipmentToDisplay}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          handleEquipmentClick={handleEquipmentItemClick}
        />
      )}
      
      {!isLoading && equipmentToDisplay.length === 0 && (
        <NoEquipmentFound resetFilters={resetAllFilters} />
      )}
    </>
  );
};

export default React.memo(EquipmentContentSection);
