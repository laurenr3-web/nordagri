
import { useState, useMemo } from 'react';
import { Part } from '@/types/Part';

// Définir ce type ici pour le rendre disponible à l'importation
export type PartsView = 'grid' | 'list';

export const usePartsFilter = () => {
  // Filtres et vue
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterManufacturers, setFilterManufacturers] = useState<string[]>([]);
  const [filterMinPrice, setFilterMinPrice] = useState(0);
  const [filterMaxPrice, setFilterMaxPrice] = useState(0);
  const [filterInStock, setFilterInStock] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentView, setCurrentView] = useState<PartsView>('grid');

  // Fonction pour filtrer les pièces
  const filterParts = (parts: Part[]) => {
    return parts.filter(part => {
      // Filtrer par recherche (nom, numéro, fabricant)
      if (searchTerm && !matchesSearchTerm(part, searchTerm)) {
        return false;
      }
      
      // Filtrer par catégorie
      if (selectedCategory !== 'all' && part.category !== selectedCategory) {
        return false;
      }
      
      // Filtrer par fabricant
      if (filterManufacturers.length > 0 && !filterManufacturers.includes(part.manufacturer)) {
        return false;
      }
      
      // Filtrer par prix min
      if (filterMinPrice > 0 && part.price < filterMinPrice) {
        return false;
      }
      
      // Filtrer par prix max
      if (filterMaxPrice > 0 && part.price > filterMaxPrice) {
        return false;
      }
      
      // Filtrer par stock
      if (filterInStock && part.stock <= 0) {
        return false;
      }
      
      return true;
    }).sort((a, b) => sortParts(a, b, sortBy));
  };
  
  // Fonction qui compte combien de filtres sont actifs
  const getFilterCount = () => {
    let count = 0;
    
    if (selectedCategory !== 'all') count++;
    if (filterManufacturers.length > 0) count++;
    if (filterMinPrice > 0) count++;
    if (filterMaxPrice > 0) count++;
    if (filterInStock) count++;
    
    return count;
  };
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setFilterManufacturers([]);
    setFilterMinPrice(0);
    setFilterMaxPrice(0);
    setFilterInStock(false);
    setSortBy('name-asc');
  };

  // Fonction pour activer/désactiver un fabricant dans le filtre
  const toggleManufacturerFilter = (manufacturer: string) => {
    if (filterManufacturers.includes(manufacturer)) {
      setFilterManufacturers(filterManufacturers.filter(m => m !== manufacturer));
    } else {
      setFilterManufacturers([...filterManufacturers, manufacturer]);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filterManufacturers,
    toggleManufacturerFilter,
    filterMinPrice,
    setFilterMinPrice,
    filterMaxPrice,
    setFilterMaxPrice,
    filterInStock,
    setFilterInStock,
    sortBy,
    setSortBy,
    currentView,
    setCurrentView,
    filterParts,
    getFilterCount,
    resetFilters
  };
};

// Fonction qui vérifie si une pièce correspond à la recherche
const matchesSearchTerm = (part: Part, searchTerm: string) => {
  const term = searchTerm.toLowerCase();
  return (
    part.name.toLowerCase().includes(term) ||
    part.partNumber.toLowerCase().includes(term) ||
    part.manufacturer.toLowerCase().includes(term)
  );
};

// Fonction pour trier les pièces
const sortParts = (a: Part, b: Part, sortBy: string) => {
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
};
