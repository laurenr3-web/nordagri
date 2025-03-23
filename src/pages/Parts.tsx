import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';

// Import components
import PartsHeader from '@/components/parts/PartsHeader';
import PartsToolbar from '@/components/parts/PartsToolbar';
import PartsGrid from '@/components/parts/PartsGrid';
import PartsList from '@/components/parts/PartsList';
import AddCategoryDialog from '@/components/parts/dialogs/AddCategoryDialog';
import FilterDialog from '@/components/parts/dialogs/FilterDialog';
import SortDialog from '@/components/parts/dialogs/SortDialog';
import OrderDialog from '@/components/parts/dialogs/OrderDialog';

// Import dialogs
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PartDetails from '@/components/parts/PartDetails';
import { AddPartForm } from '@/components/parts/AddPartForm';

// Sample parts data
const initialPartsData = partsData;

const Parts = () => {
  const {
    // State
    filteredParts,
    selectedPart,
    categories,
    manufacturers,
    searchTerm,
    selectedCategory,
    currentView,
    filterManufacturers,
    filterMinPrice,
    filterMaxPrice,
    filterInStock,
    sortBy,
    newCategory,
    orderQuantity,
    orderNote,
    isOrderSuccess,
    filterCount,
    
    // Dialog states
    isPartDetailsDialogOpen,
    isAddPartDialogOpen,
    isAddCategoryDialogOpen,
    isFilterDialogOpen,
    isSortDialogOpen,
    isOrderDialogOpen,
    
    // Setters
    setSearchTerm,
    setSelectedCategory,
    setCurrentView,
    setFilterMinPrice,
    setFilterMaxPrice,
    setFilterInStock,
    setSortBy,
    setNewCategory,
    setOrderQuantity,
    setOrderNote,
    setIsPartDetailsDialogOpen,
    setIsAddPartDialogOpen,
    setIsAddCategoryDialogOpen,
    setIsFilterDialogOpen,
    setIsSortDialogOpen,
    setIsOrderDialogOpen,
    
    // Actions
    handleAddPart,
    applyFilters,
    resetFilters,
    addNewCategory,
    openPartDetails,
    openOrderDialog,
    handleOrderSubmit,
    toggleManufacturerFilter,
    handleEditPart,
    handleDeletePart
  } = useParts(initialPartsData);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PartsHeader 
            openAddCategoryDialog={() => setIsAddCategoryDialogOpen(true)}
            openAddPartDialog={() => setIsAddPartDialogOpen(true)}
          />
          
          {/* Search and Filter Toolbar */}
          <PartsToolbar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentView={currentView}
            setCurrentView={setCurrentView}
            openFilterDialog={() => setIsFilterDialogOpen(true)}
            openSortDialog={() => setIsSortDialogOpen(true)}
            filterCount={filterCount}
          />
          
          {/* Category Tabs */}
          <Tabs defaultValue="all" className="mb-6" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap h-auto p-1">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="mb-1 mr-1">
                  {category === 'all' ? 'All Parts' : 
                    category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* Parts Display (Grid or List) */}
          {currentView === 'grid' ? (
            <PartsGrid 
              parts={filteredParts} 
              openPartDetails={openPartDetails} 
              openOrderDialog={openOrderDialog} 
            />
          ) : (
            <PartsList 
              parts={filteredParts} 
              openPartDetails={openPartDetails} 
              openOrderDialog={openOrderDialog} 
            />
          )}
          
          {/* Empty State */}
          {filteredParts.length === 0 && (
            <div className="mt-10 text-center">
              <p className="text-muted-foreground">No parts found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Reset filters
              </Button>
            </div>
          )}
          
          {/* Dialogs */}
          <Dialog
            open={isPartDetailsDialogOpen}
            onOpenChange={setIsPartDetailsDialogOpen}
          >
            <DialogContent 
              className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <DialogHeader>
                <DialogTitle>Part Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected part
                </DialogDescription>
              </DialogHeader>
              {selectedPart && (
                <PartDetails 
                  part={selectedPart} 
                  onEdit={handleEditPart}
                  onDelete={handleDeletePart}
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Other dialogs */}
          <Dialog 
            open={isAddPartDialogOpen} 
            onOpenChange={setIsAddPartDialogOpen}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Part</DialogTitle>
                <DialogDescription>
                  Fill out the form below to add a new part to the inventory
                </DialogDescription>
              </DialogHeader>
              <AddPartForm 
                onSuccess={handleAddPart}
                onCancel={() => setIsAddPartDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          {/* Filter Dialog */}
          <FilterDialog 
            isOpen={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
            manufacturers={manufacturers}
            filterManufacturers={filterManufacturers}
            toggleManufacturerFilter={toggleManufacturerFilter}
            filterMinPrice={filterMinPrice}
            setFilterMinPrice={setFilterMinPrice}
            filterMaxPrice={filterMaxPrice}
            setFilterMaxPrice={setFilterMaxPrice}
            filterInStock={filterInStock}
            setFilterInStock={setFilterInStock}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
          />
          
          {/* Sort Dialog */}
          <SortDialog 
            isOpen={isSortDialogOpen}
            onOpenChange={setIsSortDialogOpen}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Add Category Dialog */}
          <AddCategoryDialog 
            isOpen={isAddCategoryDialogOpen}
            onOpenChange={setIsAddCategoryDialogOpen}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            addNewCategory={addNewCategory}
          />
          
          {/* Order Dialog */}
          <OrderDialog 
            isOpen={isOrderDialogOpen}
            onOpenChange={setIsOrderDialogOpen}
            selectedPart={selectedPart}
            orderQuantity={orderQuantity}
            setOrderQuantity={setOrderQuantity}
            orderNote={orderNote}
            setOrderNote={setOrderNote}
            isOrderSuccess={isOrderSuccess}
            handleOrderSubmit={handleOrderSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Parts;
