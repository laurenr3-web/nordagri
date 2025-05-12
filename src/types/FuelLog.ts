
/**
 * Types related to fuel logs
 */

export interface FuelLog {
  id: string;
  equipment_id: number;
  date: string;
  fuel_quantity_liters: number;
  price_per_liter: number;
  total_cost: number;
  hours_at_fillup: number | null;
  km_at_fillup: number | null;
  notes: string | null;
  created_at: string;
  created_by: string;
  farm_id: string;
}

export interface FuelLogFormValues {
  date: Date;
  fuel_quantity_liters: number;
  price_per_liter: number;
  hours_at_fillup?: number | null;
  km_at_fillup?: number | null;
  notes?: string;
}
