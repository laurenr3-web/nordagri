
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { getParts } from './getParts';

// Update parameter type to accept either string or number
export async function getPartsForEquipment(equipmentId: string | number): Promise<Part[]> {
  console.log('🔍 Fetching parts compatible with equipment ID:', equipmentId);
  
  try {
    // Ensure equipment ID is handled correctly
    const numericId = typeof equipmentId === 'string' ? parseInt(equipmentId, 10) : equipmentId;
    
    // 1. First fetch the equipment details to get type, model, etc.
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', numericId)
      .single();
    
    if (equipmentError) {
      console.error('Error fetching equipment details:', equipmentError);
      throw equipmentError;
    }
    
    if (!equipment) {
      throw new Error(`Equipment with ID ${equipmentId} not found`);
    }
    
    // 2. Create search terms based on equipment properties
    const searchTerms = [
      equipment.name,
      equipment.model,
      equipment.manufacturer,
      equipment.type,
      equipment.category
    ].filter(Boolean).map(term => term.toLowerCase());
    
    // 3. Get all parts
    const allParts = await getParts();
    
    // 4. Filter parts that are compatible with this equipment
    const compatibleParts = allParts.filter(part => {
      // Check if equipment id is directly in the compatibility array
      if (part.compatibility.some(comp => 
          typeof comp === 'number' && comp === numericId ||
          typeof comp === 'string' && (comp === equipmentId.toString() || parseInt(comp, 10) === numericId)
      )) {
        return true;
      }
      
      // Check if any equipment property matches any compatibility string
      return part.compatibility.some(comp => {
        if (typeof comp !== 'string') return false;
        const compLower = comp.toLowerCase();
        return searchTerms.some(term => compLower.includes(term));
      });
    });
    
    console.log(`✅ Found ${compatibleParts.length} parts compatible with equipment ID ${equipmentId}`);
    return compatibleParts;
  } catch (error) {
    console.error('Error in getPartsForEquipment:', error);
    throw error;
  }
}
