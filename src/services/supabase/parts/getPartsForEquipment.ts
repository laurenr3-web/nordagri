
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData';

export async function getPartsForEquipment(equipmentId: number | string): Promise<Part[]> {
  console.log(`🔍 Fetching parts for equipment ID: ${equipmentId}`);
  
  try {
    // Get the current user ID from the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return partsData.filter((part, index) => index % 2 === 0);
    }
    
    const userId = sessionData.session?.user.id;
    
    // If user is not authenticated, return mock data
    if (!userId) {
      console.warn('User not authenticated, returning filtered sample parts data');
      return partsData.filter((part, index) => index % 2 === 0); // Return a subset of parts as an example
    }
    
    // Try to fetch parts from the database
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*')
      .eq('owner_id', userId)
      .filter('compatible_with', 'cs', `{${equipmentId}}`);
    
    if (error) {
      console.error('Error fetching parts for equipment:', error);
      // Return filtered sample data as fallback
      return partsData.filter(part => 
        part.compatibility && part.compatibility.some(equip => 
          equip.toLowerCase().includes(equipmentId.toString().toLowerCase())
        )
      );
    }
    
    console.log(`Found ${data?.length || 0} compatible parts for equipment ${equipmentId}`);
    
    // If no parts found, return filtered sample data
    if (!data || data.length === 0) {
      console.info('No parts found for this equipment, using filtered sample data');
      return partsData.filter((part, index) => index % 2 === 0);
    }
    
    // Convert database records to Part objects
    return data.map(part => ({
      id: part.id,
      name: part.name,
      partNumber: part.part_number || '',
      category: part.category || '',
      manufacturer: part.supplier || '',
      compatibility: part.compatible_with || [],
      stock: part.quantity,
      price: part.unit_price !== null ? part.unit_price : 0,
      location: part.location || '',
      reorderPoint: part.reorder_threshold || 5,
      image: part.image_url || 'https://placehold.co/400x300/png?text=No+Image'
    }));
  } catch (error) {
    console.error('Error in getPartsForEquipment():', error);
    // Return filtered sample data as fallback
    return partsData.filter(part => 
      part.compatibility && 
      part.compatibility.some(equip => equip.includes(equipmentId.toString()))
    );
  }
}
