
import { useState } from 'react';
import { PartFormValues } from '@/components/parts/AddPartForm';
import { useToast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';

export const useParts = (initialParts: Part[]) => {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  // Selected part state
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  
  // Dialog states
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  
  // New category state
  const [newCategory, setNewCategory] = useState('');
  
  // Order states
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [orderNote, setOrderNote] = useState('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('grid');
  const [filterManufacturers, setFilterManufacturers] = useState<string[]>([]);
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const [filterInStock, setFilterInStock] = useState<boolean>(false);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('name-asc');
  
  // Get unique manufacturers for filter
  const manufacturers = [...new Set(parts.map(part => part.manufacturer))];

  // Get unique categories for tabs
  const categories = [...new Set(['all', 'filters', 'engine', 'drive', 'hydraulic', 'electrical', 'brake', 'cooling', ...customCategories])];
  
  // Calculate filter count for badge
  const filterCount = filterManufacturers.length + 
    (filterMinPrice !== '' ? 1 : 0) + 
    (filterMaxPrice !== '' ? 1 : 0) + 
    (filterInStock ? 1 : 0);
  
  // Handle manufacturer filter toggle
  const toggleManufacturerFilter = (manufacturer: string) => {
    if (filterManufacturers.includes(manufacturer)) {
      setFilterManufacturers(filterManufacturers.filter(m => m !== manufacturer));
    } else {
      setFilterManufacturers([...filterManufacturers, manufacturer]);
    }
  };
  
  // Apply filters to parts list
  const filteredParts = parts.filter(part => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    
    const matchesManufacturer = filterManufacturers.length === 0 || 
      filterManufacturers.includes(part.manufacturer);
    
    const matchesPrice = 
      (filterMinPrice === '' || part.price >= parseFloat(filterMinPrice)) &&
      (filterMaxPrice === '' || part.price <= parseFloat(filterMaxPrice));
    
    const matchesStock = !filterInStock || part.stock > 0;
    
    return matchesSearch && matchesCategory && matchesManufacturer && matchesPrice && matchesStock;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  const handleAddPart = (formData: PartFormValues) => {
    const newPart = {
      id: parts.length + 1,
      name: formData.name,
      partNumber: formData.partNumber,
      category: formData.category,
      compatibility: formData.compatibility.split(',').map(item => item.trim()),
      manufacturer: formData.manufacturer,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      location: formData.location,
      reorderPoint: parseInt(formData.reorderPoint),
      image: formData.image
    };
    
    // If this is a new category, add it to our custom categories
    if (!categories.includes(formData.category)) {
      setCustomCategories([...customCategories, formData.category]);
    }
    
    setParts([...parts, newPart]);
    setIsAddPartDialogOpen(false);
  };

  // Handle editing a part
  const handleEditPart = (updatedPart: Part) => {
    setParts(parts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    ));
    
    // If this is a new category, add it to our custom categories
    if (!categories.includes(updatedPart.category)) {
      setCustomCategories([...customCategories, updatedPart.category]);
    }
    
    setIsPartDetailsDialogOpen(false);
    
    toast({
      title: "Pièce mise à jour",
      description: `Les informations de "${updatedPart.name}" ont été mises à jour avec succès`,
    });
  };
  
  // Handle deleting a part
  const handleDeletePart = (partId: number) => {
    const partToDelete = parts.find(part => part.id === partId);
    setParts(parts.filter(part => part.id !== partId));
    setIsPartDetailsDialogOpen(false);
    
    if (partToDelete) {
      toast({
        title: "Pièce supprimée",
        description: `La pièce "${partToDelete.name}" a été supprimée avec succès`,
      });
    }
  };
  
  const applyFilters = () => {
    setIsFilterDialogOpen(false);
  };
  
  const resetFilters = () => {
    setFilterManufacturers([]);
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterInStock(false);
    setIsFilterDialogOpen(false);
  };

  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      const category = newCategory.trim();
      setCustomCategories([...customCategories, category]);
      setSelectedCategory(category);
      setNewCategory('');
      setIsAddCategoryDialogOpen(false);
      toast({
        title: "Category added",
        description: `Category "${category}" added successfully`,
      });
    }
  };

  const openPartDetails = (part: Part) => {
    setSelectedPart(part);
    setIsPartDetailsDialogOpen(true);
  };

  const openOrderDialog = (part: Part) => {
    setSelectedPart(part);
    setOrderQuantity('1');
    setOrderNote('');
    setIsOrderSuccess(false);
    setIsOrderDialogOpen(true);
  };

  const handleOrderSubmit = () => {
    // Here you would normally submit the order to your backend
    // For now, we'll just show a success message
    setIsOrderSuccess(true);
    
    // Update the part stock in our local state
    if (selectedPart) {
      const quantity = parseInt(orderQuantity);
      setParts(parts.map(part => 
        part.id === selectedPart.id 
          ? { ...part, stock: part.stock + quantity } 
          : part
      ));
    }
    
    // Show a toast notification
    setTimeout(() => {
      setIsOrderDialogOpen(false);
      toast({
        title: "Order placed successfully",
        description: `Ordered ${orderQuantity} units of ${selectedPart?.name}`,
      });
    }, 1500);
  };

  return {
    // State
    parts,
    filteredParts,
    selectedPart,
    customCategories,
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
    setFilterManufacturers,
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
  };
};
