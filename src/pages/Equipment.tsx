
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { useEquipmentRealtime } from '@/hooks/equipment/useEquipmentRealtime';

// Import refactored components
import EquipmentHeader from '@/components/equipment/display/EquipmentHeader';
import SearchToolbar from '@/components/equipment/filter/SearchToolbar';
import CategoryTabs from '@/components/equipment/display/CategoryTabs';
import EquipmentGrid from '@/components/equipment/display/EquipmentGrid';
import EquipmentList from '@/components/equipment/display/EquipmentList';
import NoEquipmentFound from '@/components/equipment/display/NoEquipmentFound';
import { useEquipmentFilters, EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import { getStatusColor, getStatusText } from '@/components/equipment/utils/statusUtils';
import { Equipment } from '@/services/supabase/equipmentService';

const EquipmentPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  
  // Use the equipment data hook to fetch and manage equipment
  const {
    equipment,
    isLoading,
    addEquipment,
    isAdding
  } = useEquipmentData();
  
  // Set up realtime updates
  useEquipmentRealtime();
  
  // Transform the equipment data to include UI-specific properties
  const transformedEquipment: EquipmentItem[] = React.useMemo(() => {
    if (!equipment) return [];
    
    return equipment.map((item: Equipment) => ({
      id: item.id,
      name: item.name,
      type: item.type || 'Unknown',
      category: item.category || 'Uncategorized',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      year: item.year || 0,
      status: item.status || 'unknown',
      location: item.location || '',
      lastMaintenance: item.lastMaintenance ? item.lastMaintenance.toString() : 'N/A',
      image: item.image || '',
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate ? item.purchaseDate.toString() : '',
      usage: { hours: 0, target: 500 }, // Default values
      nextService: { type: 'Regular maintenance', due: 'In 30 days' } // Default values
    }));
  }, [equipment]);

  const {
    searchTerm,
    setSearchTerm,
    currentView,
    setCurrentView,
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
  } = useEquipmentFilters(transformedEquipment);

  const handleAddEquipment = (data: any) => {
    // Create new equipment object from form data
    const newEquipment = {
      name: data.name,
      type: data.type,
      category: data.category,
      manufacturer: data.manufacturer,
      model: data.model,
      year: parseInt(data.year),
      status: data.status,
      location: data.location,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      notes: data.notes,
      image: data.image,
    };
    
    console.log('Adding new equipment:', newEquipment);
    
    // Add equipment using the hook function
    addEquipment(newEquipment);
    setIsAddDialogOpen(false);
  };

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    setSelectedEquipment(equipment);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
            <div className="max-w-7xl mx-auto">
              <EquipmentHeader 
                openAddDialog={() => setIsAddDialogOpen(true)} 
              />
              
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
                  handleEquipmentClick={handleEquipmentClick}
                />
              ) : (
                <EquipmentList 
                  equipment={filteredEquipment}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  handleEquipmentClick={handleEquipmentClick}
                />
              )}
              
              {!isLoading && filteredEquipment.length === 0 && (
                <NoEquipmentFound resetFilters={resetAllFilters} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <EquipmentForm 
            onSubmit={handleAddEquipment}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isAdding}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog open={!!selectedEquipment} onOpenChange={(open) => !open && setSelectedEquipment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          {selectedEquipment && <EquipmentDetails equipment={selectedEquipment} />}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default EquipmentPage;
