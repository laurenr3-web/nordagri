
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SidebarToggleButton } from '@/components/ui/sidebar';

// Import components
import PartsHeader from '@/components/parts/PartsHeader';
import PartsToolbar from '@/components/parts/PartsToolbar';
import PartsGrid from '@/components/parts/PartsGrid';
import PartsList from '@/components/parts/PartsList';

// Import dialogs
import PartsDialogs from '@/components/parts/PartsDialogs';

const PartsContainer = ({
  // State
  filteredParts,
  selectedPart,
  categories,
  searchTerm,
  selectedCategory,
  currentView,
  filterCount,
  
  // Setters
  setSearchTerm,
  setSelectedCategory,
  setCurrentView,
  
  // Dialog states
  isPartDetailsDialogOpen,
  isAddPartDialogOpen,
  isAddCategoryDialogOpen,
  isFilterDialogOpen,
  isSortDialogOpen,
  isOrderDialogOpen,
  
  // Setters for dialogs
  setIsPartDetailsDialogOpen,
  setIsAddPartDialogOpen,
  setIsAddCategoryDialogOpen,
  setIsFilterDialogOpen,
  setIsSortDialogOpen,
  setIsOrderDialogOpen,
  
  // Actions
  ...actions
}) => {
  return (
    <div className="flex-1 w-full">
      {/* Menu button for mobile */}
      <SidebarToggleButton className="fixed top-2 left-2 z-50 md:hidden" />
      
      <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
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
              openPartDetails={actions.openPartDetails} 
              openOrderDialog={actions.openOrderDialog} 
            />
          ) : (
            <PartsList 
              parts={filteredParts} 
              openPartDetails={actions.openPartDetails} 
              openOrderDialog={actions.openOrderDialog} 
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
          <PartsDialogs 
            // Parts and selection
            selectedPart={selectedPart}
            
            // Dialogs state
            isPartDetailsDialogOpen={isPartDetailsDialogOpen}
            isAddPartDialogOpen={isAddPartDialogOpen}
            isAddCategoryDialogOpen={isAddCategoryDialogOpen}
            isFilterDialogOpen={isFilterDialogOpen}
            isSortDialogOpen={isSortDialogOpen}
            isOrderDialogOpen={isOrderDialogOpen}
            
            // Dialog setters
            setIsPartDetailsDialogOpen={setIsPartDetailsDialogOpen}
            setIsAddPartDialogOpen={setIsAddPartDialogOpen}
            setIsAddCategoryDialogOpen={setIsAddCategoryDialogOpen}
            setIsFilterDialogOpen={setIsFilterDialogOpen}
            setIsSortDialogOpen={setIsSortDialogOpen}
            setIsOrderDialogOpen={setIsOrderDialogOpen}
            
            // Actions, filters, and dialogs props
            {...actions}
          />
        </div>
      </div>
    </div>
  );
};

export default PartsContainer;
