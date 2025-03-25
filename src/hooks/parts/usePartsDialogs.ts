
import { useState } from 'react';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';

export const usePartsDialogs = () => {
  const { toast } = useToast();
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isEditPartDialogOpen, setIsEditPartDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [newCategory, setNewCategory] = useState('');

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

  // Function to add new category
  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      toast({
        title: "Category added",
        description: `Category "${newCategory}" added successfully`,
      });
      
      const category = newCategory.trim();
      setNewCategory('');
      return category;
    }
    return null;
  };

  return {
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isSortDialogOpen,
    setIsSortDialogOpen,
    isAddPartDialogOpen,
    setIsAddPartDialogOpen,
    isEditPartDialogOpen,
    setIsEditPartDialogOpen,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    isPartDetailsDialogOpen,
    setIsPartDetailsDialogOpen,
    isAddCategoryDialogOpen,
    setIsAddCategoryDialogOpen,
    selectedPart,
    setSelectedPart,
    newCategory,
    setNewCategory,
    handleEditPart,
    handleOrderClick,
    addNewCategory
  };
};
