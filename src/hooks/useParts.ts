
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Part } from '@/types/Part';
import { partsService } from '@/services/supabase/partsService';

export const useParts = (initialParts: Part[] = []) => {
  const queryClient = useQueryClient();
  const [parts, setParts] = useState<Part[]>(initialParts);

  // State for filtering and sorting
  const [filterManufacturers, setFilterManufacturers] = useState<string[]>([]);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  // State for part details and dialogs
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // State for add category dialog
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // State for order dialog
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [orderNote, setOrderNote] = useState('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // Fetch parts from Supabase
  const { data: supabaseParts, isLoading, isError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsService.getParts(),
    onSettled: (data) => {
      if (data && data.length > 0) {
        setParts(data);
      } else if (initialParts.length > 0 && (!data || data.length === 0)) {
        // If Supabase has no data but we have initial data, use initial data
        console.log('No parts in Supabase, using initial data');
        setParts(initialParts);
      }
    }
  });

  // Add part mutation
  const addPartMutation = useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => 
      partsService.addPart(part),
    onSuccess: (newPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts([...parts, newPart]);
      toast.success(`Part '${newPart.name}' added successfully`);
    },
    onError: (error) => {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  });

  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: (part: Part) => partsService.updatePart(part),
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(parts.map(part => part.id === updatedPart.id ? updatedPart : part));
      toast.success(`Part '${updatedPart.name}' updated successfully`);
    },
    onError: (error) => {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  });

  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: (partId: number) => partsService.deletePart(partId),
    onSuccess: (_, partId) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(parts.filter(part => part.id !== partId));
      toast.success('Part deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  });

  // Filter and sort functions
  const toggleManufacturerFilter = (manufacturer: string) => {
    if (filterManufacturers.includes(manufacturer)) {
      setFilterManufacturers(filterManufacturers.filter(m => m !== manufacturer));
    } else {
      setFilterManufacturers([...filterManufacturers, manufacturer]);
    }
  };

  const resetFilters = () => {
    setFilterManufacturers([]);
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterInStock(false);
    setCategoryFilter('all');
    setSearchTerm('');
  };

  const applyFilters = () => {
    setIsFilterDialogOpen(false);
  };

  // Get all distinct manufacturers for filtering
  const manufacturers = Array.from(new Set((supabaseParts || parts).map(part => part.manufacturer))).filter(Boolean);

  // Get all distinct categories for filtering
  const categories = Array.from(new Set([
    ...(supabaseParts || parts).map(part => part.category),
    ...customCategories
  ])).filter(Boolean);

  // Filter and sort parts
  const filteredParts = (supabaseParts || parts).filter(part => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    
    // Manufacturer filter
    const matchesManufacturer = filterManufacturers.length === 0 || 
      filterManufacturers.includes(part.manufacturer);
    
    // Price filter
    const minPrice = filterMinPrice ? parseFloat(filterMinPrice) : 0;
    const maxPrice = filterMaxPrice ? parseFloat(filterMaxPrice) : Infinity;
    const partPrice = typeof part.price === 'number' ? part.price : parseFloat(part.price.toString());
    const matchesPrice = !isNaN(partPrice) && partPrice >= minPrice && partPrice <= maxPrice;
    
    // In stock filter
    const matchesStock = !filterInStock || part.stock > 0;
    
    return matchesSearch && matchesCategory && matchesManufacturer && matchesPrice && matchesStock;
  }).sort((a, b) => {
    const [field, direction] = sortBy.split('-');
    let comparison = 0;
    
    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        const aPrice = typeof a.price === 'number' ? a.price : parseFloat(a.price.toString());
        const bPrice = typeof b.price === 'number' ? b.price : parseFloat(b.price.toString());
        comparison = aPrice - bPrice;
        break;
      case 'quantity':
        comparison = a.stock - b.stock;
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });

  // Functions for handling part operations
  const handleViewPart = (part: Part) => {
    setSelectedPart(part);
    setIsPartDetailsDialogOpen(true);
  };

  const handleAddPart = (partData: any) => {
    const newPart: Omit<Part, 'id'> = {
      name: partData.name,
      partNumber: partData.partNumber || '',
      category: partData.category || '',
      manufacturer: partData.manufacturer || '',
      compatibility: partData.compatibility || [],
      stock: parseInt(partData.stock) || 0,
      price: partData.price ? parseFloat(partData.price) : 0,
      location: partData.location || '',
      reorderPoint: parseInt(partData.reorderPoint) || 5,
      image: partData.image || 'https://placehold.co/100x100/png'
    };
    
    addPartMutation.mutate(newPart);
    setIsAddPartDialogOpen(false);
  };

  const handleEditPart = (updatedPart: Part) => {
    updatePartMutation.mutate(updatedPart);
    setIsPartDetailsDialogOpen(false);
  };

  const handleDeletePart = (partId: number) => {
    deletePartMutation.mutate(partId);
    setIsPartDetailsDialogOpen(false);
  };

  const addNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCustomCategories([...customCategories, newCategory]);
      toast.success(`Category '${newCategory}' added`);
      setNewCategory('');
      setIsAddCategoryDialogOpen(false);
    } else {
      toast.error('Category already exists or is invalid');
    }
  };

  const handleOrderSubmit = () => {
    setIsOrderSuccess(true);
    setTimeout(() => {
      setIsOrderDialogOpen(false);
      setIsOrderSuccess(false);
      setOrderQuantity('1');
      setOrderNote('');
      toast.success('Order placed successfully');
    }, 1500);
  };

  // Calculate filter count
  const filterCount = 
    (filterManufacturers.length > 0 ? 1 : 0) + 
    (filterMinPrice || filterMaxPrice ? 1 : 0) + 
    (filterInStock ? 1 : 0) + 
    (categoryFilter !== 'all' ? 1 : 0);

  // Additional functions for Part component props
  const openPartDetails = (part: Part) => handleViewPart(part);
  const openOrderDialog = (part: Part) => {
    setSelectedPart(part);
    setIsOrderDialogOpen(true);
  };

  const selectedCategory = categoryFilter;
  const setSelectedCategory = setCategoryFilter;

  // Return all the state and functions needed by the components
  return {
    parts: filteredParts,
    filteredParts,
    isLoading,
    isError,
    currentView,
    setCurrentView,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    selectedCategory,
    setSelectedCategory,
    filterCount,
    categories,
    manufacturers,
    filterManufacturers,
    toggleManufacturerFilter,
    filterMinPrice,
    setFilterMinPrice,
    filterMaxPrice,
    setFilterMaxPrice,
    filterInStock,
    setFilterInStock,
    sortBy,
    setSortBy,
    selectedPart,
    setSelectedPart,
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
    resetFilters,
    applyFilters,
    handleViewPart,
    openPartDetails,
    openOrderDialog,
    handleAddPart,
    handleEditPart,
    handleDeletePart,
    newCategory,
    setNewCategory,
    addNewCategory,
    orderQuantity,
    setOrderQuantity,
    orderNote,
    setOrderNote,
    isOrderSuccess,
    handleOrderSubmit
  };
};
