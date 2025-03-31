
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions, Category } from './types';

/**
 * Récupère les options de filtrage pour les équipements
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    // Récupérer tous les équipements pour extraire les options de filtrage
    const { data, error } = await supabase
      .from('equipment')
      .select('status, type, category, manufacturer, location, year');
    
    if (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
    
    // Initialiser les options de filtrage
    const options: FilterOptions = {
      status: [],
      type: [],
      category: [],
      manufacturer: [],
      location: [],
      yearRange: { min: Infinity, max: -Infinity }
    };
    
    // Extraire les options uniques
    data.forEach(item => {
      // Status
      if (item.status && !options.status.includes(item.status)) {
        options.status.push(item.status);
      }
      
      // Type
      if (item.type && !options.type.includes(item.type)) {
        options.type.push(item.type);
      }
      
      // Category
      if (item.category && !options.category.includes(item.category)) {
        options.category.push(item.category);
      }
      
      // Manufacturer
      if (item.manufacturer && !options.manufacturer.includes(item.manufacturer)) {
        options.manufacturer.push(item.manufacturer);
      }
      
      // Location
      if (item.location && !options.location.includes(item.location)) {
        options.location.push(item.location);
      }
      
      // Year range
      if (item.year) {
        options.yearRange.min = Math.min(options.yearRange.min, item.year);
        options.yearRange.max = Math.max(options.yearRange.max, item.year);
      }
    });
    
    // Si aucun équipement avec année, définir des valeurs par défaut
    if (options.yearRange.min === Infinity) {
      options.yearRange.min = new Date().getFullYear() - 20;
    }
    if (options.yearRange.max === -Infinity) {
      options.yearRange.max = new Date().getFullYear();
    }
    
    // Trier les options alphabétiquement
    options.status.sort();
    options.type.sort();
    options.category.sort();
    options.manufacturer.sort();
    options.location.sort();
    
    return options;
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    // Retourner des options par défaut en cas d'erreur
    return {
      status: ['operational', 'maintenance', 'repair', 'inactive'],
      type: [],
      category: [],
      manufacturer: [],
      location: [],
      yearRange: { 
        min: new Date().getFullYear() - 20, 
        max: new Date().getFullYear() 
      }
    };
  }
}

/**
 * Récupère les catégories d'équipements
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('equipment_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching equipment categories:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
}
