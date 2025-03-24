import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';

// Import refactored components
import EquipmentHeader from '@/components/equipment/display/EquipmentHeader';
import SearchToolbar from '@/components/equipment/filter/SearchToolbar';
import CategoryTabs from '@/components/equipment/display/CategoryTabs';
import EquipmentGrid from '@/components/equipment/display/EquipmentGrid';
import EquipmentList from '@/components/equipment/display/EquipmentList';
import NoEquipmentFound from '@/components/equipment/display/NoEquipmentFound';
import { useEquipmentFilters, EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import { getStatusColor, getStatusText } from '@/components/equipment/utils/statusUtils';

// Sample data
const initialEquipmentData = [
  {
    id: 1,
    name: 'John Deere 8R 410',
    type: 'Tractor',
    category: 'heavy',
    manufacturer: 'John Deere',
    model: '8R 410',
    year: 2022,
    status: 'operational',
    location: 'North Field',
    lastMaintenance: '2023-05-15',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 342, target: 500 },
    serialNumber: 'JD8R410-22-7834',
    purchaseDate: '2022-03-12',
    nextService: { type: 'Filter Change', due: 'In 3 weeks' }
  },
  {
    id: 2,
    name: 'Case IH Axial-Flow',
    type: 'Harvester',
    category: 'heavy',
    manufacturer: 'Case IH',
    model: 'Axial-Flow 250',
    year: 2021,
    status: 'maintenance',
    location: 'East Field',
    lastMaintenance: '2023-04-22',
    image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 480, target: 500 },
    serialNumber: 'CIAF250-21-4532',
    purchaseDate: '2021-06-18',
    nextService: { type: 'Full Service', due: 'In 2 days' }
  },
  {
    id: 3,
    name: 'Kubota M7-172',
    type: 'Tractor',
    category: 'medium',
    manufacturer: 'Kubota',
    model: 'M7-172',
    year: 2020,
    status: 'repair',
    location: 'Workshop',
    lastMaintenance: '2023-03-05',
    image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 620, target: 500 },
    serialNumber: 'KM7172-20-9876',
    purchaseDate: '2020-11-23',
    nextService: { type: 'Engine Check', due: 'Overdue' }
  },
  {
    id: 4,
    name: 'Massey Ferguson 8S.245',
    type: 'Tractor',
    category: 'heavy',
    manufacturer: 'Massey Ferguson',
    model: '8S.245',
    year: 2023,
    status: 'operational',
    location: 'South Field',
    lastMaintenance: '2023-05-30',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 120, target: 500 },
    serialNumber: 'MF8S245-23-2341',
    purchaseDate: '2023-02-15',
    nextService: { type: 'First Service', due: 'In 1 month' }
  },
  {
    id: 5,
    name: 'New Holland T6.180',
    type: 'Tractor',
    category: 'medium',
    manufacturer: 'New Holland',
    model: 'T6.180',
    year: 2021,
    status: 'operational',
    location: 'West Field',
    lastMaintenance: '2023-04-15',
    image: 'https://images.unsplash.com/photo-1590599145244-e577fa879033?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 356, target: 500 },
    serialNumber: 'NHT6180-21-6543',
    purchaseDate: '2021-05-10',
    nextService: { type: 'Oil Change', due: 'In 2 weeks' }
  },
  {
    id: 6,
    name: 'Fendt 942 Vario',
    type: 'Tractor',
    category: 'heavy',
    manufacturer: 'Fendt',
    model: '942 Vario',
    year: 2022,
    status: 'maintenance',
    location: 'Workshop',
    lastMaintenance: '2023-02-28',
    image: 'https://images.unsplash.com/photo-1581381236742-2489aa307e6e?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 410, target: 500 },
    serialNumber: 'F942V-22-8765',
    purchaseDate: '2022-01-20',
    nextService: { type: 'Transmission Check', due: 'Tomorrow' }
  }
];

const Equipment = () => {
  const [equipmentData, setEquipmentData] = useState(initialEquipmentData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  
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
  } = useEquipmentFilters(equipmentData);

  const handleAddEquipment = (data: any) => {
    const newEquipment = {
      id: equipmentData.length + 1,
      name: data.name,
      type: data.type,
      category: data.category,
      manufacturer: data.manufacturer,
      model: data.model,
      year: parseInt(data.year),
      status: data.status,
      location: data.location,
      lastMaintenance: new Date().toISOString().split('T')[0],
      image: data.image,
      usage: { hours: 0, target: 500 },
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      nextService: { type: 'First Service', due: 'In 1 month' }
    };
    
    setEquipmentData([...equipmentData, newEquipment]);
    setIsAddDialogOpen(false);
    toast({
      title: "Equipment added",
      description: `${data.name} has been added to your equipment list.`,
    });
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
              
              {currentView === 'grid' ? (
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
              
              {filteredEquipment.length === 0 && (
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

export default Equipment;
