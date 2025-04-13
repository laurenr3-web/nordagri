
// Re-export adapters
export * from '@/hooks/dashboard/adapters';
// Use export type since we're re-exporting types with isolatedModules
export type { MaintenanceFrequency, MaintenanceType, MaintenancePriority, MaintenanceUnit } from '@/hooks/maintenance/types/maintenancePlanTypes';
