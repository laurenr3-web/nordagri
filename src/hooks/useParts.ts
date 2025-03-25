
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

  // State for part details and dialogs
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

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
    onSuccess: (data) => {
      if (data.length > 0) {
        setParts(data);
      } else if (initialParts.length > 0 && data.length === 0) {
        // If Supabase has no data but we have initial data, use initial data
        console.log('No parts in Supabase, using initial data');
        setParts(initialParts);
      }
    }
  });

  // Add part mutation
  const addPartMutation = useMutation({
    mutationFn: (part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => 
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
    const price = parseFloat(part.price);
    const matchesPrice = !isNaN(price) && price >= minPrice && price <= maxPrice;
    
    // In stock filter
    const matchesStock = !filterInStock || part.quantity > 0;
    
    return matchesSearch && matchesCategory && matchesManufacturer && matchesPrice && matchesStock;
  }).sort((a, b) => {
    const [field, direction] = sortBy.split('-');
    let comparison = 0;
    
    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = parseFloat(a.price) - parseFloat(b.price);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
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
    const newPart: Omit<Part, 'id' | 'createdAt' | 'updatedAt'> = {
      name: partData.name,
      partNumber: partData.partNumber || '',
      category: partData.category || '',
      manufacturer: partData.manufacturer || '',
      compatibleWith: partData.compatibleWith || [],
      quantity: parseInt(partData.quantity) || 0,
      price: partData.price || '0',
      location: partData.location || '',
      lastOrdered: partData.lastOrdered ? new Date(partData.lastOrdered) : undefined,
      reorderThreshold: parseInt(partData.reorderThreshold) || 5,
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

  // Return all the state and functions needed by the components
  return {
    parts: filteredParts,
    isLoading,
    isError,
    currentView,
    setCurrentView,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
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
