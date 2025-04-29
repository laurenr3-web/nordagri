
export interface Equipment {
  id: number;
  name: string;
  type?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  status?: string;
  location?: string;
  image?: string;
  serialNumber?: string;
  purchaseDate?: Date | string;
  notes?: string;
  valeur_actuelle?: number;
  farm_id?: string;
}
