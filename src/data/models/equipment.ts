
/**
 * Modèle de données pour les équipements
 */
export interface Equipment {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  purchaseDate?: Date;
  location?: string;
  status?: string;
  type?: string;
  category?: string;
  image?: string;
  notes?: string;
}

/**
 * Filtres pour la recherche d'équipements
 */
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
