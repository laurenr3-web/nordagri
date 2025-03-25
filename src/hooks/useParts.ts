
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
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  
  // Fetch parts from Supabase
  const { data: supabaseParts, isLoading, isError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsService.getParts(),
    meta: {
      onSuccess: (data: Part[]) => {
        console.log('Fetched parts from Supabase:', data);
        if (data && data.length > 0) {
          setParts(data);
        } else if (initialParts.length > 0) {
          console.log('No parts in Supabase, using initial data');
          setParts(initialParts);
        }
      },
      onError: (error: Error) => {
        console.error('Error fetching parts:', error);
        if (initialParts.length > 0) {
          console.log('Error occurred when fetching from Supabase, using initial data');
          setParts(initialParts);
        }
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
    mutationFn: (part: Omit<Part, 'id'>) => {
      console.log('Adding part to Supabase:', part);
      return partsService.addPart(part);
    },
    onSuccess: (newPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(prevParts => [...prevParts, newPart]);
      
      toast({
        title: "Pièce ajoutée",
        description: `${newPart.name} a été ajouté à l'inventaire`,
      });
      
      setIsAddPartDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error adding part:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la pièce",
        variant: "destructive",
      });
    }
  });
  
  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: (part: Part) => {
      console.log('Updating part in Supabase:', part);
      return partsService.updatePart(part);
    },
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(prevParts => prevParts.map(p => p.id === updatedPart.id ? updatedPart : p));
      
      toast({
        title: "Pièce mise à jour",
        description: `${updatedPart.name} a été mis à jour`,
      });
      
      setIsEditPartDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      console.error('Error updating part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la pièce",
        variant: "destructive",
      });
    }
  });
  
  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: (partId: number) => {
      console.log('Deleting part from Supabase:', partId);
      return partsService.deletePart(partId);
    },
    onSuccess: (_, partId) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(prevParts => prevParts.filter(p => p.id !== partId));
      
      toast({
        title: "Pièce supprimée",
        description: "La pièce a été supprimée de l'inventaire",
      });
      
      setSelectedPart(null);
    },
    onError: (error) => {
      console.error('Error deleting part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pièce",
        variant: "destructive",
      });
    }
  });
  
  // Order parts mutation
  const orderPartMutation = useMutation({
    mutationFn: (part: Part) => {
      console.log('Ordering more of part in Supabase:', part);
      const updatedPart = {
        ...part,
        stock: part.stock + 10,  // Order 10 more
      };
      return partsService.updatePart(updatedPart);
    },
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(prevParts => prevParts.map(p => p.id === updatedPart.id ? updatedPart : p));
      
      toast({
        title: "Commande passée",
        description: `La commande pour ${updatedPart.name} a été passée`,
      });
      
      setIsOrderDialogOpen(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      console.error('Error ordering part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de passer la commande",
        variant: "destructive",
      });
    }
  });
  
  // Function to add a part
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    console.log('Adding part:', part);
    addPartMutation.mutate(part);
  };
  
  // Function to update a part
  const handleUpdatePart = (part: Part) => {
    console.log('Updating part:', part);
    updatePartMutation.mutate(part);
  };
  
  // Function to delete a part
  const handleDeletePart = (partId: number) => {
    console.log('Deleting part:', partId);
    deletePartMutation.mutate(partId);
  };
  
  // Function to order a part
  const handleOrderPart = (part: Part) => {
    console.log('Ordering part:', part);
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

  // Use effect to update parts when supabaseParts changes
  useEffect(() => {
    if (supabaseParts && supabaseParts.length > 0) {
      setParts(supabaseParts);
      console.log('Updated parts state with Supabase data:', supabaseParts);
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
    isPartDetailsDialogOpen,
    setIsPartDetailsDialogOpen,
    isAddCategoryDialogOpen,
    setIsAddCategoryDialogOpen,
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
