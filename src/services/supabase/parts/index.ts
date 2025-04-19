
import { Part } from '@/types/Part';
import { getParts } from './getParts';
import { addPart } from './addPartService';
import { updatePart } from './updatePart';
import { deletePart, deleteMultipleParts } from './deletePart';
import { getPartsForEquipment } from './getPartsForEquipment';
import { withdrawPart } from './withdrawPart';
import { getPartWithdrawals, getPartWithdrawalsCount } from './getPartWithdrawals';

// Create a consolidated service object for backward compatibility
export const partsService = {
  getParts,
  addPart,
  updatePart,
  deletePart,
  deleteMultipleParts,
  getPartsForEquipment,
  withdrawPart,
  getPartWithdrawals,
  getPartWithdrawalsCount
};

// Export individual functions for direct imports
export {
  getParts,
  addPart,
  updatePart,
  deletePart,
  deleteMultipleParts,
  getPartsForEquipment,
  withdrawPart,
  getPartWithdrawals,
  getPartWithdrawalsCount
};

// Export the Part type for convenience
export type { Part };

// Expose for browser console testing
if (typeof window !== 'undefined') {
  (window as any).partsService = partsService;
}
