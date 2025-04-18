
import { Part } from '@/types/Part';
import { getParts } from './getParts';
import { addPart } from './addPartService';
import { updatePart } from './updatePart';
import { deletePart, deleteMultipleParts } from './deletePart';
import { getPartsForEquipment } from './getPartsForEquipment';

// Create a consolidated service object for backward compatibility
export const partsService = {
  getParts,
  addPart,
  updatePart,
  deletePart,
  deleteMultipleParts,
  getPartsForEquipment
};

// Export individual functions for direct imports
export {
  getParts,
  addPart,
  updatePart,
  deletePart,
  deleteMultipleParts,
  getPartsForEquipment
};

// Export the Part type for convenience
export type { Part };

// Expose for browser console testing
if (typeof window !== 'undefined') {
  (window as any).partsService = partsService;
}
