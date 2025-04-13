
// Re-export intervention types from the centralized models
export {
  InterventionStatus,
  InterventionPriority,
  PartUsed,
  Intervention,
  InterventionFormValues,
  InterventionReportData
} from './models/intervention';

import { Intervention } from './models/intervention';

/**
 * Create a default intervention object
 */
export const createDefaultIntervention = (): Intervention => ({
  id: 0,
  title: '',
  equipment: '',
  equipmentId: 0,
  status: 'scheduled',
  priority: 'medium',
  date: new Date(),
  technician: '',
  location: '',
  notes: ''
});

/**
 * Utilities for validating intervention data
 */
export const interventionValidators = {
  isValidTitle: (title: string): boolean => title.trim().length >= 2,
  isValidPriority: (priority: string): boolean => ['low', 'medium', 'high'].includes(priority),
  isValidStatus: (status: string): boolean => 
    ['scheduled', 'in-progress', 'completed', 'canceled'].includes(status),
  isValidDate: (date: Date): boolean => !isNaN(date.getTime()),
  isValidDuration: (duration: number): boolean => duration > 0
};

/**
 * Utility for coordinate format conversion
 */
export const convertCoordinates = {
  toLatLng: (coords?: {latitude: number; longitude: number}) => {
    if (!coords) return undefined;
    return {
      lat: coords.latitude,
      lng: coords.longitude
    };
  },
  toLatitudeLongitude: (coords?: {lat: number; lng: number}) => {
    if (!coords) return undefined;
    return {
      latitude: coords.lat,
      longitude: coords.lng
    };
  }
};
