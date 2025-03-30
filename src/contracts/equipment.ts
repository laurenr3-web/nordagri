
/**
 * Interface contract for equipment data
 * Provides explicit type safety and validation utilities
 */
export interface EquipmentData {
  readonly id: number;
  readonly name: string;
  readonly type?: string;
  readonly status?: string;
  readonly model?: string;
  readonly manufacturer?: string;
  readonly year?: number;
  readonly serialNumber?: string;
  readonly purchaseDate?: Date | string;
  readonly location?: string;
  readonly image?: string;
  readonly notes?: string;
  readonly category?: string;
  readonly usage?: {
    hours: number;
    target: number;
  };
  readonly nextService?: {
    type: string;
    due: string;
  };
}

/**
 * Type guard to validate if an unknown value is a valid EquipmentData object
 * @param data The data to validate
 * @returns A type predicate indicating if the data is valid EquipmentData
 */
export function isValidEquipment(data: unknown): data is EquipmentData {
  return (
    typeof data === 'object' && 
    data !== null &&
    'id' in data && 
    typeof (data as any).id === 'number' &&
    'name' in data && 
    typeof (data as any).name === 'string'
  );
}

/**
 * Type guard for equipment status values
 * @param status The status string to validate
 * @returns Whether the status is a valid equipment status
 */
export function isValidEquipmentStatus(status: unknown): status is 'operational' | 'maintenance' | 'repair' | 'inactive' {
  return typeof status === 'string' && 
    ['operational', 'maintenance', 'repair', 'inactive'].includes(status);
}

/**
 * Asserts that the provided data is valid EquipmentData
 * Throws an error if validation fails
 * @param data Data to validate
 * @returns The validated EquipmentData
 */
export function assertEquipmentData(data: unknown): EquipmentData {
  if (!isValidEquipment(data)) {
    throw new TypeError('Invalid equipment data structure');
  }
  return data;
}
