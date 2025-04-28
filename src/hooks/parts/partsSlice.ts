import { useState } from 'react';
import { Part } from '@/types/Part';
import { PartFormValues } from '@/components/parts/form/partFormTypes';
import { useToast } from '@/hooks/use-toast';
import { parseCompatibilityString } from '@/utils/compatibilityConverter';

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
    // Convert compatibility to number array using our utility
    const compatibilityValue = formData.compatibility;
    let compatibilityArray: number[] = [];
    
    if (Array.isArray(compatibilityValue)) {
      // If already an array, ensure all items are numbers
      compatibilityArray = compatibilityValue
        .map(item => typeof item === 'string' ? parseInt(item, 10) : item)
        .filter(item => !isNaN(item)) as number[];
    } else if (typeof compatibilityValue === 'string') {
      // If string, parse it as comma-separated values
      compatibilityArray = compatibilityValue
        .split(',')
        .map(item => parseInt(item.trim(), 10))
        .filter(item => !isNaN(item));
    }

    const newPart = {
      id: parts.length + 1,
      name: formData.name,
      partNumber: formData.partNumber,
      category: formData.category,
      compatibility: compatibilityArray,
      compatibleWith: [], // For backwards compatibility
      manufacturer: formData.manufacturer || '',
      price: parseFloat(formData.price || '0'),
      stock: parseInt(formData.stock || '0'),
      location: formData.location || '',
      reorderPoint: parseInt(formData.reorderPoint || '5'),
      image: formData.image || ''
    };
    
    // If this is a new category, add it to our custom categories
    const categories = getCategories();
    if (!categories.includes(formData.category)) {
      setCustomCategories([...customCategories, formData.category]);
    }
    
    setParts([...parts, newPart]);
    return newPart;
  };

  // ... keep existing code for handleEditPart, handleDeletePart, addNewCategory

  return {
    parts,
    setParts,
    customCategories,
    selectedPart,
    setSelectedPart,
    getCategories,
    getManufacturers,
    handleAddPart,
    handleEditPart: (part: Part) => {
      setParts(parts.map(p => p.id === part.id ? part : p));
      
      // If this is a new category, add it
      const categories = getCategories();
      if (!categories.includes(part.category)) {
        setCustomCategories([...customCategories, part.category]);
      }
      
      toast({
        title: "Pièce mise à jour",
        description: `Les informations de "${part.name}" ont été mises à jour avec succès`,
      });
    },
    handleDeletePart: (partId: number) => {
      const partToDelete = parts.find(part => part.id === partId);
      setParts(parts.filter(part => part.id !== partId));
      
      if (partToDelete) {
        toast({
          title: "Pièce supprimée",
          description: `La pièce "${partToDelete.name}" a été supprimée avec succès`,
        });
      }
    },
    addNewCategory: (newCategory: string) => {
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
    },
  };
};
