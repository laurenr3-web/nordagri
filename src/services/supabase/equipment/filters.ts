
import { SupabaseClient } from '@supabase/supabase-js';
import { EquipmentFilter } from './types';

/**
 * Apply filters to Supabase query
 */
export const applyFilters = (query: any, filters: EquipmentFilter) => {
  // Apply search filter
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    query = query.or(`name.ilike.${searchTerm},type.ilike.${searchTerm},serial_number.ilike.${searchTerm}`);
  }

  // Apply type filter
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  // Apply category filter
  if (filters.category) {
    query = query.eq('metadata->category', filters.category);
  }

  // Apply manufacturer filter
  if (filters.manufacturer) {
    query = query.eq('metadata->manufacturer', filters.manufacturer);
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  // Apply location filter
  if (filters.location) {
    query = query.eq('metadata->location', filters.location);
  }

  // Apply year filter if present
  if (filters.year) {
    query = query.eq('metadata->year', filters.year.toString());
  }

  // Apply sorting
  if (filters.sortBy) {
    const column = getSortColumn(filters.sortBy);
    const order = filters.sortOrder || 'asc';
    query = query.order(column, { ascending: order === 'asc' });
  } else {
    // Default sorting
    query = query.order('name', { ascending: true });
  }

  return query;
};

/**
 * Map frontend sort fields to database columns
 */
function getSortColumn(sortBy: string): string {
  switch (sortBy) {
    case 'name':
      return 'name';
    case 'status':
      return 'status';
    case 'type':
      return 'type';
    case 'year':
      return 'metadata->year';
    case 'manufacturer':
      return 'metadata->manufacturer';
    default:
      return 'name';
  }
}
