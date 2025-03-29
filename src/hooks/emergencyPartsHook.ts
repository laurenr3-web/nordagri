
import { useState } from 'react';
import { partsData } from '@/data/partsData';
import { Part } from '@/types/Part';

export const useEmergencyParts = () => {
  const [parts, setParts] = useState(partsData);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterManufacturers, setFilterManufacturers] = useState<string[]>([]);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('1');
  // Add the missing properties
  const [newCategory, setNewCategory] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Extract unique categories and manufacturers
  const categories = [...new Set(parts.map(part => part.category))].filter(Boolean) as string[];
  const manufacturers = [...new Set(parts.map(part => part.manufacturer))].filter(Boolean) as string[];

  // Simple filter implementation
  const filteredParts = parts.filter(part => {
    // Search term filter
    if (searchTerm && !part.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && part.category !== selectedCategory) {
      return false;
    }
    
    // Manufacturer filter
    if (filterManufacturers.length > 0 && part.manufacturer && 
        !filterManufacturers.includes(part.manufacturer)) {
      return false;
    }
    
    // Price filters
    const minPrice = filterMinPrice ? parseFloat(filterMinPrice) : 0;
    const maxPrice = filterMaxPrice ? parseFloat(filterMaxPrice) : Infinity;
    if (part.price < minPrice || part.price > maxPrice) {
      return false;
    }
    
    // In stock filter
    if (filterInStock && (!part.stock || part.stock <= 0)) {
      return false;
    }
    
    return true;
  });

  const toggleManufacturerFilter = (manufacturer: string) => {
    setFilterManufacturers(prev => 
      prev.includes(manufacturer) 
        ? prev.filter(m => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilterManufacturers([]);
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterInStock(false);
    setSortBy('');
  };

  const handleAddPart = (part: Part) => {
    console.log('Emergency mode: Add part', part);
    // In a real implementation, this would add the part to the state
  };

  const handleUpdatePart = (part: Part) => {
    console.log('Emergency mode: Update part', part);
    // In a real implementation, this would update the part in the state
  };

  const handleDeletePart = (partId: string | number) => {
    console.log('Emergency mode: Delete part', partId);
    // In a real implementation, this would remove the part from the state
  };

  const handleOrderSubmit = () => {
    console.log('Emergency mode: Order submitted for part', selectedPart);
    setIsOrderDialogOpen(false);
  };

  const openPartDetails = (part: Part) => {
    setSelectedPart(part);
  };

  const openOrderDialog = (part: Part) => {
    setSelectedPart(part);
    setIsOrderDialogOpen(true);
  };

  // Add the missing function
  const addNewCategory = () => {
    console.log('Emergency mode: Add new category', newCategory);
    if (newCategory.trim()) {
      setNewCategory('');
    }
    return newCategory;
  };

  // Calculate filter count for UI
  const filterCount = [
    selectedCategory ? 1 : 0,
    filterManufacturers.length > 0 ? 1 : 0,
    filterMinPrice || filterMaxPrice ? 1 : 0,
    filterInStock ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return {
    parts,
    filteredParts,
    isLoading: false,
    isError: false,
    categories,
    currentView,
    setCurrentView,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filterManufacturers,
    manufacturers,
    toggleManufacturerFilter,
    filterMinPrice,
    setFilterMinPrice,
    filterMaxPrice,
    setFilterMaxPrice,
    filterInStock,
    setFilterInStock,
    filterCount,
    clearFilters,
    sortBy,
    setSortBy,
    isPartDetailsDialogOpen,
    setIsPartDetailsDialogOpen,
    isAddPartDialogOpen,
    setIsAddPartDialogOpen,
    isAddCategoryDialogOpen,
    setIsAddCategoryDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isSortDialogOpen,
    setIsSortDialogOpen,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    selectedPart,
    setSelectedPart,
    orderQuantity,
    setOrderQuantity,
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
    handleOrderSubmit,
    openPartDetails,
    openOrderDialog,
    // Include the missing properties and function
    newCategory,
    setNewCategory,
    addNewCategory,
    orderNote,
    setOrderNote
  };
};
