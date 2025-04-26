import { useState } from 'react';
import { Part } from '@/types/Part';
import { PartFormValues } from '@/components/parts/form/partFormTypes';
import { useToast } from '@/hooks/use-toast';

export const usePartsSlice = (initialParts: Part[]) => {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Get unique categories for tabs
  const getCategories = () => {
    return [...new Set(['all', 'filters', 'engine', 'drive', 'hydraulic', 'electrical', 'brake', 'cooling', ...customCategories])];
  };

  // Get unique manufacturers for filter
  const getManufacturers = () => {
    return [...new Set(parts.map(part => part.manufacturer))];
  };

  const handleAddPart = (formData: PartFormValues) => {
    const newPart: Part = {
      id: parts.length + 1,
      name: formData.name,
      partNumber: formData.partNumber,
      category: formData.category,
      compatibility: formData.compatibility
        ? formData.compatibility.split(',').map(item => parseInt(item.trim(), 10) || 0)
        : [],
      manufacturer: formData.manufacturer,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      location: formData.location,
      reorderPoint: parseInt(formData.reorderPoint),
      image: formData.image
    };
    
    // If this is a new category, add it to our custom categories
    const categories = getCategories();
    if (!categories.includes(formData.category)) {
      setCustomCategories([...customCategories, formData.category]);
    }
    
    setParts([...parts, newPart]);
    return newPart;
  };

  const handleEditPart = (updatedPart: Part) => {
    setParts(parts.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    ));
    
    // If this is a new category, add it to our custom categories
    const categories = getCategories();
    if (!categories.includes(updatedPart.category)) {
      setCustomCategories([...customCategories, updatedPart.category]);
    }
    
    toast({
      title: "Pièce mise à jour",
      description: `Les informations de "${updatedPart.name}" ont été mises à jour avec succès`,
    });
  };
  
  const handleDeletePart = (partId: number) => {
    const partToDelete = parts.find(part => part.id === partId);
    setParts(parts.filter(part => part.id !== partId));
    
    if (partToDelete) {
      toast({
        title: "Pièce supprimée",
        description: `La pièce "${partToDelete.name}" a été supprimée avec succès`,
      });
    }
  };

  const addNewCategory = (newCategory: string) => {
    if (newCategory.trim() !== '') {
      const category = newCategory.trim();
      setCustomCategories([...customCategories, category]);
      
      toast({
        title: "Category added",
        description: `Category "${category}" added successfully`,
      });
      
      return category;
    }
    return null;
  };

  return {
    parts,
    setParts,
    customCategories,
    selectedPart,
    setSelectedPart,
    getCategories,
    getManufacturers,
    handleAddPart,
    handleEditPart,
    handleDeletePart,
    addNewCategory,
  };
};
