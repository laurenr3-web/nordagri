
import { EquipmentFilter } from './types';

/**
 * Construit une requête Supabase avec les filtres d'équipement appliqués
 */
export function buildEquipmentFilterQuery(query: any, filter: EquipmentFilter): any {
  // Filtre de recherche textuelle
  if (filter.search && filter.search.trim() !== '') {
    const searchTerm = filter.search.trim();
    query = query.or(
      `name.ilike.%${searchTerm}%,` +
      `model.ilike.%${searchTerm}%,` +
      `manufacturer.ilike.%${searchTerm}%,` +
      `type.ilike.%${searchTerm}%,` +
      `category.ilike.%${searchTerm}%,` +
      `location.ilike.%${searchTerm}%`
    );
  }
  
  // Filtres multi-sélection par status
  if (filter.status && filter.status.length > 0) {
    query = query.in('status', filter.status);
  }
  
  // Filtres multi-sélection par type
  if (filter.type && filter.type.length > 0) {
    query = query.in('type', filter.type);
  }
  
  // Filtres multi-sélection par catégorie
  if (filter.category && filter.category.length > 0) {
    query = query.in('category', filter.category);
  }
  
  // Filtres multi-sélection par fabricant
  if (filter.manufacturer && filter.manufacturer.length > 0) {
    query = query.in('manufacturer', filter.manufacturer);
  }
  
  // Filtres multi-sélection par emplacement
  if (filter.location && filter.location.length > 0) {
    query = query.in('location', filter.location);
  }
  
  // Filtre par année minimum
  if (filter.yearMin !== undefined) {
    query = query.gte('year', filter.yearMin);
  }
  
  // Filtre par année maximum
  if (filter.yearMax !== undefined) {
    query = query.lte('year', filter.yearMax);
  }
  
  return query;
}
