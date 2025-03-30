
import { EquipmentFilter } from '@/data/models/equipment';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Application des filtres à la requête Supabase
 */
export const applyFilters = <T>(
  query: PostgrestFilterBuilder<any, any, T>,
  filters?: EquipmentFilter
): PostgrestFilterBuilder<any, any, T> => {
  if (!filters) return query;

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters.type && filters.type.length > 0) {
    query = query.in('type', filters.type);
  }

  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  if (filters.manufacturer && filters.manufacturer.length > 0) {
    query = query.in('manufacturer', filters.manufacturer);
  }

  if (filters.location && filters.location.length > 0) {
    query = query.in('location', filters.location);
  }

  if (filters.yearMin) {
    query = query.gte('year', filters.yearMin);
  }

  if (filters.yearMax) {
    query = query.lte('year', filters.yearMax);
  }

  return query;
};
