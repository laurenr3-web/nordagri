
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { getParts } from './getParts';
import { addPart } from './addPart';
import { updatePart } from './updatePart';
import { deletePart } from './deletePart';
import { getPartsForEquipment } from './getPartsForEquipment';

// Create a consolidated service object for backward compatibility
export const partsService = {
  getParts,
  addPart,
  updatePart,
  deletePart,
  getPartsForEquipment
};

// Export individual functions for direct imports
export {
  getParts,
  addPart,
  updatePart,
  deletePart,
  getPartsForEquipment
};

// Export the Part type for convenience
export type { Part };

// Expose for browser console testing
if (typeof window !== 'undefined') {
  (window as any).partsService = partsService;
}
