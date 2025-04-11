
/**
 * Types pour les équipements
 */

// Statuts possibles pour un équipement
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'inactive';

// Interface principale pour un équipement
export interface Equipment {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  purchaseDate?: Date;
  location?: string;
  status?: EquipmentStatus;
  type?: string;
  category?: string;
  image?: string;
  notes?: string;
  usage?: {
    hours: number;
    target: number;
  };
  nextService?: {
    type: string;
    due: Date | string;
  };
}

// Interface pour les filtres d'équipement
export interface EquipmentFilter {
  search?: string;
  status?: string[];
  type?: string[];
  category?: string[];
  manufacturer?: string[];
  location?: string[];
  yearMin?: number;
  yearMax?: number;
}

// Interface pour les statistiques d'équipement
export interface EquipmentStats {
  total: number;
  operational: number;
  maintenance: number;
  repair: number;
  inactive: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

// Interface pour les options de filtre
export interface FilterOptions {
  status: string[];
  type: string[];
  category: string[];
  manufacturer: string[];
  location: string[];
  yearRange: { min: number; max: number };
}

// Fonctions de validation pour les données d'équipement
export const equipmentValidators = {
  isValidName: (name: string): boolean => name.trim().length >= 2,
  isValidStatus: (status: string): boolean => 
    ['operational', 'maintenance', 'repair', 'inactive'].includes(status),
  isValidYear: (year: number): boolean => 
    !isNaN(year) && year > 1900 && year <= new Date().getFullYear()
};

// Fonction utilitaire pour créer un équipement par défaut
export const createDefaultEquipment = (): Omit<Equipment, 'id'> => ({
  name: '',
  status: 'operational',
  purchaseDate: new Date(),
});
