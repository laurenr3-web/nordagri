import { useState, useMemo } from 'react';

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
  serialNumber: string;
  purchaseDate: string;
  usage: { hours: number; target: number };
  nextService: { type: string; due: string };
}

interface FilterState {
  searchTerm: string;
  filterStatus: string[];
  filterType: string[];
  filterCategory: string[];
  filterManufacturer: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function useEquipmentFilters(equipmentItems: EquipmentItem[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    filterStatus: [],
    filterType: [],
    filterCategory: [],
    filterManufacturer: [],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const filterOptions = useMemo(() => {
    const statusSet = new Set<string>();
    const typeSet = new Set<string>();
    const categorySet = new Set<string>();
    const manufacturerSet = new Set<string>();

    equipmentItems.forEach(item => {
      if (item.status) statusSet.add(item.status);
      if (item.type) typeSet.add(item.type);
      if (item.category) categorySet.add(item.category);
      if (item.manufacturer) manufacturerSet.add(item.manufacturer);
    });

    return {
      status: Array.from(statusSet),
      type: Array.from(typeSet),
      category: Array.from(categorySet),
      manufacturer: Array.from(manufacturerSet)
    };
  }, [equipmentItems]);

  const filteredEquipment = useMemo(() => {
    return equipmentItems
      .filter(item => {
        if (filters.searchTerm && !item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
            !item.type.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
            !item.manufacturer.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return false;
        }

        if (filters.filterStatus.length > 0 && !filters.filterStatus.includes(item.status)) {
          return false;
        }

        if (filters.filterType.length > 0 && !filters.filterType.includes(item.type)) {
          return false;
        }

        if (filters.filterCategory.length > 0 && !filters.filterCategory.includes(item.category)) {
          return false;
        }

        if (filters.filterManufacturer.length > 0 && !filters.filterManufacturer.includes(item.manufacturer)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const sortField = filters.sortBy as keyof EquipmentItem;
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortOrder === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
  }, [equipmentItems, filters]);

  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => {
      const newStatus = prev.filterStatus.includes(status)
        ? prev.filterStatus.filter(s => s !== status)
        : [...prev.filterStatus, status];
      return { ...prev, filterStatus: newStatus };
    });
  };

  const toggleTypeFilter = (type: string) => {
    setFilters(prev => {
      const newType = prev.filterType.includes(type)
        ? prev.filterType.filter(t => t !== type)
        : [...prev.filterType, type];
      return { ...prev, filterType: newType };
    });
  };

  const toggleCategoryFilter = (category: string) => {
    setFilters(prev => {
      const newCategory = prev.filterCategory.includes(category)
        ? prev.filterCategory.filter(c => c !== category)
        : [...prev.filterCategory, category];
      return { ...prev, filterCategory: newCategory };
    });
  };

  const toggleManufacturerFilter = (manufacturer: string) => {
    setFilters(prev => {
      const newManufacturer = prev.filterManufacturer.includes(manufacturer)
        ? prev.filterManufacturer.filter(m => m !== manufacturer)
        : [...prev.filterManufacturer, manufacturer];
      return { ...prev, filterManufacturer: newManufacturer };
    });
  };

  const setSortBy = (field: string) => {
    setFilters(prev => {
      const newOrder = prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: field, sortOrder: newOrder };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      filterStatus: [],
      filterType: [],
      filterCategory: [],
      filterManufacturer: [],
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  return {
    filters,
    filterOptions,
    filteredEquipment,
    setSearchTerm,
    toggleStatusFilter,
    toggleTypeFilter,
    toggleCategoryFilter,
    toggleManufacturerFilter,
    setSortBy,
    resetFilters
  };
}
