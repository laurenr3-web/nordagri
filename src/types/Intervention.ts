
/**
 * Types pour les interventions
 */

// Statuts possibles pour une intervention
export type InterventionStatus = 
  | 'pending' 
  | 'scheduled' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

// Niveaux de priorité pour une intervention
export type InterventionPriority = 'low' | 'medium' | 'high';

// Interface de base pour une pièce utilisée dans une intervention
export interface PartUsed {
  id: number;
  name: string;
  quantity: number;
}

// Interface pour les interventions urgentes affichées dans le tableau de bord
export interface UrgentIntervention {
  id: number;
  title: string;
  equipment: string;
  priority: InterventionPriority;
  date: Date;
  status: InterventionStatus;
  technician: string;
  location: string;
}

// Interface complète pour une intervention
export interface Intervention {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  description?: string;
  status: InterventionStatus;
  priority: InterventionPriority;
  date: Date;
  scheduledDuration?: number;
  duration?: number;
  technician: string;
  location: string;
  notes?: string;
  partsUsed?: PartUsed[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
  ownerId?: string;
}

// Interface pour les valeurs de formulaire d'intervention
export interface InterventionFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  priority: InterventionPriority;
  date: Date;
  scheduledDuration?: number;
  technician?: string;
  description?: string;
  notes?: string;
}

// Interface pour les données de rapport d'intervention
export interface InterventionReportData {
  duration: number;
  notes: string;
  partsUsed: PartUsed[];
}

// Fonction utilitaire pour créer une intervention par défaut
export const createDefaultIntervention = (): Intervention => ({
  id: 0,
  title: '',
  equipment: '',
  equipmentId: 0,
  status: 'pending',
  priority: 'medium',
  date: new Date(),
  technician: '',
  location: '',
});

// Fonctions de validation pour les données d'intervention
export const interventionValidators = {
  isValidTitle: (title: string): boolean => title.trim().length >= 2,
  isValidPriority: (priority: string): boolean => ['low', 'medium', 'high'].includes(priority),
  isValidStatus: (status: string): boolean => 
    ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'].includes(status),
  isValidDate: (date: Date): boolean => !isNaN(date.getTime()),
  isValidDuration: (duration: number): boolean => duration > 0
};

// Fonction utilitaire pour mapper entre lat/lng et latitude/longitude
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
