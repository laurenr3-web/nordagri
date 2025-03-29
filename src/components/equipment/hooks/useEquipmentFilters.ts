import { useState, useMemo } from 'react';
import { Equipment } from '@/services/supabase/equipmentService';

export interface EquipmentItem {
  id: number | string;
  name: string;
  type: string;
  category: string;
  manufacturer: string;
  model: string;
  year: number;
  status: string;
  location: string;
  lastMaintenance: string;
  image: string;
  usage: { hours: number; target: number };
  serialNumber: string;
  purchaseDate: string;
  nextService: { type: string; due: string };
}

export const useEquipmentFilters = (equipmentData: EquipmentItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    manufacturer: [] as string[],
    year: [] as number[],
  });
  
  // Sort options
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get unique values for filter options
  const statusOptions = useMemo(() => 
    Array.from(new Set(equipmentData.map(item => item.status))),
    [equipmentData]
  );
  
  const typeOptions = useMemo(() => 
    Array.from(new Set(equipmentData.map(item => item.type))),
    [equipmentData]
  );
  
  const manufacturerOptions = useMemo(() => 
    Array.from(new Set(equipmentData.map(item => item.manufacturer))),
    [equipmentData]
  );
  
  const yearOptions = useMemo(() => 
    Array.from(new Set(equipmentData.map(item => item.year))).sort((a, b) => b - a),
    [equipmentData]
  );

  // Toggle filter value
  const toggleFilter = (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => {
    setFilters(prev => {
      const existing = prev[type];
      if (existing.includes(value as never)) {
        return { ...prev, [type]: existing.filter(item => item !== value) };
      } else {
        return { ...prev, [type]: [...existing, value as never] };
      }
    });
  };
  
  // Check if a filter is active
  const isFilterActive = (type: 'status' | 'type' | 'manufacturer' | 'year', value: string | number) => {
    return filters[type].includes(value as never);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: [],
      type: [],
      manufacturer: [],
      year: [],
    });
  };
  
  // Count active filters
  const activeFilterCount = Object.values(filters).reduce(
    (count, filterArray) => count + filterArray.length, 0
  );
  
  // Reset all filters including search term and category
  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    clearFilters();
  };

  // Filter and sort equipment
  const filteredEquipment = useMemo(() => {
    return equipmentData.filter(equipment => {
      // Search term filtering
      const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           equipment.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filtering
      const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
      
      // Status filtering
      const matchesStatus = filters.status.length === 0 || filters.status.includes(equipment.status);
      
      // Type filtering
      const matchesType = filters.type.length === 0 || filters.type.includes(equipment.type);
      
      // Manufacturer filtering
      const matchesManufacturer = filters.manufacturer.length === 0 || filters.manufacturer.includes(equipment.manufacturer);
      
      // Year filtering
      const matchesYear = filters.year.length === 0 || filters.year.includes(equipment.year);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesType && matchesManufacturer && matchesYear;
    }).sort((a, b) => {
      // Sort by selected property
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'year') {
        comparison = a.year - b.year;
      } else if (sortBy === 'manufacturer') {
        comparison = a.manufacturer.localeCompare(b.manufacturer);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [equipmentData, searchTerm, selectedCategory, filters, sortBy, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
    currentView,
    setCurrentView,
    selectedCategory,
    setSelectedCategory,
    filters,
    statusOptions,
    typeOptions,
    manufacturerOptions,
    yearOptions,
    toggleFilter,
    isFilterActive,
    clearFilters,
    resetAllFilters,
    activeFilterCount,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredEquipment
  };
};
