
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { partsService } from '@/services/supabase/partsService';

type PartsView = 'grid' | 'list';

// Filter function that takes the search term and selected category
const filterParts = (parts: Part[], searchTerm: string, selectedCategory: string) => {
  return parts.filter((part) => {
    // Filter by search term
    const matchesSearchTerm = searchTerm === '' || 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.manufacturer && part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = selectedCategory === '' || part.category === selectedCategory;
    
    return matchesSearchTerm && matchesCategory;
  });
};

// Hook to manage the parts data
export const useParts = (initialParts: Part[] = []) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for parts and UI options
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentView, setCurrentView] = useState<PartsView>('grid');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isEditPartDialogOpen, setIsEditPartDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  
  // Fetch parts from Supabase
  const { data: supabaseParts, isLoading, isError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsService.getParts(),
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setParts(data);
      } else if (initialParts.length > 0 && (!data || data.length === 0)) {
        console.log('No parts in the database, using initial data');
        setParts(initialParts);
      }
    }
  });
  
  // Get all unique categories from parts
  const categories = Array.from(new Set(parts.map(part => part.category).filter(Boolean)));
  
  // Filtered parts based on search term and selected category
  const filteredParts = filterParts(parts, searchTerm, selectedCategory);
  
  // Get the count of active filters
  const filterCount = (searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0);
  
  // Add part mutation
  const addPartMutation = useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => partsService.addPart(part),
    onSuccess: (newPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts([...parts, newPart]);
      
      toast({
        title: "Part Added",
        description: `${newPart.name} has been added to inventory`,
      });
      
      setIsAddPartDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive",
      });
    }
  });
  
  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: (part: Part) => partsService.updatePart(part),
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(parts.map(p => p.id === updatedPart.id ? updatedPart : p));
      
      toast({
        title: "Part Updated",
        description: `${updatedPart.name} has been updated`,
      });
      
      setIsEditPartDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive",
      });
    }
  });
  
  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: (partId: number) => partsService.deletePart(partId),
    onSuccess: (_, partId) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(parts.filter(p => p.id !== partId));
      
      toast({
        title: "Part Deleted",
        description: "The part has been removed from inventory",
      });
      
      setSelectedPart(null);
    },
    onError: (error) => {
      console.error('Error deleting part:', error);
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive",
      });
    }
  });
  
  // Order parts mutation
  const orderPartMutation = useMutation({
    mutationFn: (part: Part) => {
      const updatedPart = {
        ...part,
        stock: part.stock + 10,  // Order 10 more
      };
      return partsService.updatePart(updatedPart);
    },
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(parts.map(p => p.id === updatedPart.id ? updatedPart : p));
      
      toast({
        title: "Order Placed",
        description: `Order for ${updatedPart.name} has been placed`,
      });
      
      setIsOrderDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      console.error('Error ordering part:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    }
  });
  
  // Function to add a part
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    addPartMutation.mutate(part);
  };
  
  // Function to update a part
  const handleUpdatePart = (part: Part) => {
    updatePartMutation.mutate(part);
  };
  
  // Function to delete a part
  const handleDeletePart = (partId: number) => {
    deletePartMutation.mutate(partId);
  };
  
  // Function to order a part
  const handleOrderPart = (part: Part) => {
    orderPartMutation.mutate(part);
  };
  
  // Function to open edit dialog with selected part
  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsEditPartDialogOpen(true);
  };
  
  // Function to open order dialog with selected part
  const handleOrderClick = (part: Part) => {
    setSelectedPart(part);
    setIsOrderDialogOpen(true);
  };
  
  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };
  
  // Function to handle submitting an order
  const handleOrderSubmit = () => {
    if (selectedPart) {
      handleOrderPart(selectedPart);
    }
  };

  // Use the data from supabase if available, otherwise use the local state
  useEffect(() => {
    if (supabaseParts) {
      setParts(supabaseParts);
    }
  }, [supabaseParts]);
  
  return {
    parts,
    isLoading,
    isError,
    currentView,
    setCurrentView,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredParts,
    filterCount,
    clearFilters,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isSortDialogOpen,
    setIsSortDialogOpen,
    isAddPartDialogOpen,
    setIsAddPartDialogOpen,
    isEditPartDialogOpen,
    setIsEditPartDialogOpen,
    selectedPart,
    setSelectedPart,
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
    handleEditPart,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    handleOrderClick,
    handleOrderSubmit
  };
};
