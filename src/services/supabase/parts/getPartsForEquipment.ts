
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { getParts } from './getParts';

export async function getPartsForEquipment(equipmentId: number): Promise<Part[]> {
  console.log('🔍 Fetching parts compatible with equipment ID:', equipmentId);
  
  try {
    // 1. First fetch the equipment details to get type, model, etc.
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', equipmentId)
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
          typeof comp === 'number' && comp === equipmentId ||
          typeof comp === 'string' && comp === equipmentId.toString()
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
