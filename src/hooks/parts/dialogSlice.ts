
import { useState } from 'react';
import { Part } from '@/types/Part';

export const useDialogSlice = () => {
  // Dialog states
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  
  // New category state
  const [newCategory, setNewCategory] = useState('');

  const openPartDetails = (part: Part, setSelectedPart: (part: Part | null) => void) => {
    setSelectedPart(part);
    setIsPartDetailsDialogOpen(true);
  };

  const openOrderDialog = (part: Part, setSelectedPart: (part: Part | null) => void) => {
    setSelectedPart(part);
    setIsOrderDialogOpen(true);
  };

  return {
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
    newCategory,
    setNewCategory,
    openPartDetails,
    openOrderDialog,
  };
};
