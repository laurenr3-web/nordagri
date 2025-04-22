
export interface FuelLog {
  id: string;
  equipment_id: number;
  date: string;
  fuel_quantity_liters: number;
  price_per_liter: number;
  total_cost?: number;
  hours_at_fillup?: number;
  notes?: string;
  created_at?: string;
  farm_id?: string;
  created_by?: string;
}

export interface FuelLogFormValues {
  date: Date;
  fuel_quantity_liters: number;
  price_per_liter: number;
  hours_at_fillup?: number;
  notes?: string;
}
