
import { useState } from 'react';
import { Part } from '@/types/Part';

export type PartsView = 'grid' | 'list';

export const usePartsFilter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentView, setCurrentView] = useState<PartsView>('grid');
  const [filterManufacturers, setFilterManufacturers] = useState<string[]>([]);
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const [filterInStock, setFilterInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name-asc');

  // Calculate filter count for badge
  const getFilterCount = () => {
    return filterManufacturers.length + 
      (filterMinPrice !== '' ? 1 : 0) + 
      (filterMaxPrice !== '' ? 1 : 0) + 
      (filterInStock ? 1 : 0) +
      (searchTerm ? 1 : 0) +
      (selectedCategory && selectedCategory !== 'all' ? 1 : 0);
  };
  
  // Handle manufacturer filter toggle
  const toggleManufacturerFilter = (manufacturer: string) => {
    if (filterManufacturers.includes(manufacturer)) {
      setFilterManufacturers(filterManufacturers.filter(m => m !== manufacturer));
    } else {
      setFilterManufacturers([...filterManufacturers, manufacturer]);
    }
  };
  
  // Apply filters to parts list
  const filterParts = (parts: Part[]) => {
    return parts.filter(part => {
      const matchesSearch = searchTerm === '' || 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.manufacturer && part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || selectedCategory === 'all' || part.category === selectedCategory;
      
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
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setFilterManufacturers([]);
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterInStock(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    currentView,
    setCurrentView,
    filterManufacturers,
    setFilterManufacturers,
    filterMinPrice,
    setFilterMinPrice,
    filterMaxPrice,
    setFilterMaxPrice,
    filterInStock,
    setFilterInStock,
    sortBy,
    setSortBy,
    getFilterCount,
    toggleManufacturerFilter,
    filterParts,
    resetFilters,
  };
};
