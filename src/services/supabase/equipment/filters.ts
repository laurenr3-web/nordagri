
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { EquipmentFilter } from './types';

// Apply filters to a query
export function applyFilters(
  query: PostgrestFilterBuilder<any, any, any>,
  filters: EquipmentFilter
): PostgrestFilterBuilder<any, any, any> {
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
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
    query = query.in('current_location', filters.location);
  }
  
  if (filters.yearMin) {
    query = query.gte('year', filters.yearMin);
  }
  
  if (filters.yearMax) {
    query = query.lte('year', filters.yearMax);
  }
  
  if (filters.nextMaintenanceBefore) {
    query = query.lte('next_maintenance', filters.nextMaintenanceBefore.toISOString());
  }
  
  return query;
}
