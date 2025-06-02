
import { useState, useMemo, useEffect } from 'react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

export type DensityMode = 'comfortable' | 'compact' | 'dense';

interface UseEquipmentPaginationProps {
  equipment: EquipmentItem[];
  defaultItemsPerPage?: number;
}

export function useEquipmentPagination({
  equipment,
  defaultItemsPerPage = 12
}: UseEquipmentPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [viewAll, setViewAll] = useState(false);
  const [density, setDensity] = useState<DensityMode>('comfortable');

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('equipment-pagination-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        setItemsPerPage(prefs.itemsPerPage || defaultItemsPerPage);
        setDensity(prefs.density || 'comfortable');
      }
    } catch (error) {
      console.error('Error loading pagination preferences:', error);
    }
  }, [defaultItemsPerPage]);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      const prefs = { itemsPerPage, density };
      localStorage.setItem('equipment-pagination-prefs', JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving pagination preferences:', error);
    }
  }, [itemsPerPage, density]);

  // Reset page when equipment data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [equipment]);

  const totalPages = Math.ceil(equipment.length / itemsPerPage);
  
  const paginatedEquipment = useMemo(() => {
    if (viewAll) return equipment;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return equipment.slice(start, end);
  }, [equipment, currentPage, itemsPerPage, viewAll]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setViewAll(false);
  };

  const handleViewAll = () => {
    setViewAll(true);
    setCurrentPage(1);
  };

  const getDensityGridCols = () => {
    switch (density) {
      case 'dense':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6';
      case 'comfortable':
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedEquipment,
    viewAll,
    density,
    handlePageChange,
    handleItemsPerPageChange,
    handleViewAll,
    setDensity,
    getDensityGridCols,
    showPagination: !viewAll && equipment.length > itemsPerPage,
    showViewAll: equipment.length <= 50 && !viewAll // Only show "View All" for reasonable amounts
  };
}
