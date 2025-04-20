import { useState, useMemo, useCallback } from 'react';

export interface EquipmentItem {
  id: number;
  name: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  status?: string;
  year?: number;
  category?: string;
  location?: string;
  image?: string;
  serialNumber?: string;
  purchaseDate?: string | Date;
  notes?: string;
}

export interface EquipmentFilters {
  status: Record<string, boolean>;
  type: Record<string, boolean>;
  manufacturer: Record<string, boolean>;
  year: { min: number; max: number };
}

export function useEquipmentFilters(equipment: EquipmentItem[]) {
  // État de recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // État des filtres avancés
  const [filters, setFilters] = useState<EquipmentFilters>({
    status: {},
    type: {},
    manufacturer: {},
    year: { min: 0, max: new Date().getFullYear() }
  });
  
  // Récupérer les options de filtrage à partir des données d'équipement
  const statusOptions = useMemo(() => {
    const options = new Set<string>();
    equipment.forEach(item => {
      if (item.status) options.add(item.status);
    });
    return Array.from(options).sort();
  }, [equipment]);
  
  const typeOptions = useMemo(() => {
    const options = new Set<string>();
    equipment.forEach(item => {
      if (item.type) options.add(item.type);
    });
    return Array.from(options).sort();
  }, [equipment]);
  
  const manufacturerOptions = useMemo(() => {
    const options = new Set<string>();
    equipment.forEach(item => {
      if (item.manufacturer) options.add(item.manufacturer);
    });
    return Array.from(options).sort();
  }, [equipment]);
  
  const yearOptions = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    equipment.forEach(item => {
      if (item.year) {
        min = Math.min(min, item.year);
        max = Math.max(max, item.year);
      }
    });
    
    // Si aucun équipement avec année, définir des valeurs par défaut
    if (min === Infinity) min = new Date().getFullYear() - 20;
    if (max === -Infinity) max = new Date().getFullYear();
    
    return { min, max };
  }, [equipment]);
  
  // Vérifier si un filtre est actif
  const isFilterActive = useCallback((type: string, value: string): boolean => {
    return filters[type as keyof EquipmentFilters]?.[value] || false;
  }, [filters]);
  
  // Basculer l'état d'un filtre
  const toggleFilter = useCallback((type: string, value: string) => {
    setFilters(prev => {
      const updatedFilters = { ...prev };
      
      if (type === 'status' || type === 'type' || type === 'manufacturer') {
        updatedFilters[type] = {
          ...updatedFilters[type],
          [value]: !updatedFilters[type][value]
        };
      }
      
      return updatedFilters;
    });
  }, []);
  
  // Réinitialiser les filtres par type
  const clearFilters = useCallback((type?: string) => {
    if (type) {
      setFilters(prev => ({
        ...prev,
        [type]: type === 'year' ? { min: yearOptions.min, max: yearOptions.max } : {}
      }));
    } else {
      setFilters({
        status: {},
        type: {},
        manufacturer: {},
        year: { min: yearOptions.min, max: yearOptions.max }
      });
      setSearchTerm('');
      setSelectedCategory('all');
    }
  }, [yearOptions]);
  
  // Réinitialiser tous les filtres
  const resetAllFilters = useCallback(() => {
    clearFilters();
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name');
    setSortOrder('asc');
  }, [clearFilters]);
  
  // Calculer le nombre de filtres actifs
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    // Filtres de statut
    Object.values(filters.status).forEach(value => {
      if (value) count++;
    });
    
    // Filtres de type
    Object.values(filters.type).forEach(value => {
      if (value) count++;
    });
    
    // Filtres de fabricant
    Object.values(filters.manufacturer).forEach(value => {
      if (value) count++;
    });
    
    // Filtre d'année (compter seulement si différent des valeurs par défaut)
    if (filters.year.min !== yearOptions.min || filters.year.max !== yearOptions.max) {
      count++;
    }
    
    // Filtre de catégorie
    if (selectedCategory !== 'all') {
      count++;
    }
    
    return count;
  }, [filters, selectedCategory, yearOptions]);
  
  // Filtrer les équipements selon les critères
  const filteredEquipment = useMemo(() => {
    return equipment
      .filter(item => {
        // Filtrage par terme de recherche
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            (item.name?.toLowerCase().includes(searchLower)) ||
            (item.model?.toLowerCase().includes(searchLower)) ||
            (item.manufacturer?.toLowerCase().includes(searchLower)) ||
            (item.type?.toLowerCase().includes(searchLower)) ||
            (item.serialNumber?.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return false;
        }
        
        // Filtrage par catégorie - s'assurer que la comparaison est exacte et insensible à la casse
        if (selectedCategory !== 'all') {
          if (!item.type) return false;
          
          // Pour le débogage
          console.log(`Comparing item type: "${item.type}" with selected category: "${selectedCategory}"`);
          
          // Vérification insensible à la casse
          if (item.type.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }
        
        // Filtrage par statut
        const activeStatusFilters = Object.entries(filters.status).filter(([_, active]) => active);
        if (activeStatusFilters.length > 0) {
          const statusValues = activeStatusFilters.map(([status]) => status);
          if (!item.status || !statusValues.includes(item.status)) {
            return false;
          }
        }
        
        // Filtrage par type
        const activeTypeFilters = Object.entries(filters.type).filter(([_, active]) => active);
        if (activeTypeFilters.length > 0) {
          const typeValues = activeTypeFilters.map(([type]) => type);
          if (!item.type || !typeValues.includes(item.type)) {
            return false;
          }
        }
        
        // Filtrage par fabricant
        const activeManufacturerFilters = Object.entries(filters.manufacturer).filter(([_, active]) => active);
        if (activeManufacturerFilters.length > 0) {
          const manufacturerValues = activeManufacturerFilters.map(([manufacturer]) => manufacturer);
          if (!item.manufacturer || !manufacturerValues.includes(item.manufacturer)) {
            return false;
          }
        }
        
        // Filtrage par année
        if (item.year) {
          if (item.year < filters.year.min || item.year > filters.year.max) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Trier par champ sélectionné
        if (sortBy === 'name') {
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        } 
        else if (sortBy === 'type' && a.type && b.type) {
          return sortOrder === 'asc' 
            ? a.type.localeCompare(b.type) 
            : b.type.localeCompare(a.type);
        }
        else if (sortBy === 'status' && a.status && b.status) {
          return sortOrder === 'asc' 
            ? a.status.localeCompare(b.status) 
            : b.status.localeCompare(a.status);
        }
        else if (sortBy === 'year') {
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          return sortOrder === 'asc' ? yearA - yearB : yearB - yearA;
        }
        return 0;
      });
  }, [equipment, searchTerm, selectedCategory, filters, sortBy, sortOrder]);

  return {
    searchTerm,
    setSearchTerm,
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
    filteredEquipment,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  };
}
