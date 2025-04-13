
/**
 * Common/shared types used across the application
 */

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

// Common priority levels
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Common location type
export interface Location {
  name: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Type for API database record timestamps
export interface TimestampFields {
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for database record timestamps (snake_case)
export interface DbTimestampFields {
  created_at?: string;
  updated_at?: string;
}

// Base entity interface with common fields
export interface BaseEntity {
  id: number | string;
  ownerId?: string;
}

// Base form values interface
export interface BaseFormValues {
  id?: number | string;
}
