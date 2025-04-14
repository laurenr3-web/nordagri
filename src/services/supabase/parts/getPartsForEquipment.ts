
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
    
    console.log(`Looking for parts compatible with equipment ${equipmentId} for user ${userId}`);
    
    // Try to fetch parts from the database with better error handling
    try {
      // First approach - using contains operator for compatibility array
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('owner_id', userId)
        .filter('compatible_with', 'cs', `{${equipmentId}}`);
      
      if (error) {
        console.error('Error fetching parts for equipment (method 1):', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} compatible parts for equipment ${equipmentId} (method 1)`);
      
      if (data && data.length > 0) {
        // Log raw data for debugging
        console.log('Raw parts data from Supabase:', JSON.stringify(data.slice(0, 2)));
        
        // Convert database records to Part objects with better error handling
        return data.map(part => {
          try {
            // Handle compatibility array that might be stored as string
            let compatibility: any[] = part.compatible_with || [];
            if (typeof compatibility === 'string') {
              try {
                compatibility = JSON.parse(compatibility);
              } catch {
                compatibility = [compatibility];
              }
            }
            
            // If compatibility is not an array after conversion, make it an array
            if (!Array.isArray(compatibility)) {
              compatibility = [];
            }
            
            return {
              id: part.id,
              name: part.name || 'Sans nom',
              partNumber: part.part_number || '',
              category: part.category || 'Non classé',
              manufacturer: part.supplier || '',
              compatibility: compatibility,
              stock: typeof part.quantity === 'number' ? part.quantity : 0,
              price: typeof part.unit_price === 'number' ? part.unit_price : 0,
              location: part.location || '',
              reorderPoint: typeof part.reorder_threshold === 'number' ? part.reorder_threshold : 5,
              image: part.image_url || 'https://placehold.co/400x300/png?text=No+Image'
            };
          } catch (err) {
            console.error('Error mapping part:', err, part);
            // Return a placeholder part rather than failing
            return {
              id: part.id || 'error-mapping',
              name: part.name || 'Error mapping part',
              partNumber: '',
              category: 'Error',
              manufacturer: '',
              compatibility: [],
              stock: 0,
              price: 0,
              location: '',
              reorderPoint: 5,
              image: 'https://placehold.co/400x300/png?text=Error'
            };
          }
        });
      }
      
      // Try alternative approach with text search on the compatible_with column
      console.log('No parts found with first method, trying alternative approach');
      const { data: altData, error: altError } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('owner_id', userId)
        .textSearch('compatible_with', equipmentId.toString(), {
          config: 'english'
        });
      
      if (altError) {
        console.error('Error fetching parts for equipment (method 2):', altError);
        throw altError;
      }
      
      console.log(`Found ${altData?.length || 0} compatible parts for equipment ${equipmentId} (method 2)`);
      
      if (altData && altData.length > 0) {
        // Convert database records to Part objects
        return altData.map(part => {
          let compatibility: any[] = [];
          if (part.compatible_with) {
            compatibility = Array.isArray(part.compatible_with) ? part.compatible_with : [part.compatible_with];
          }
          
          return {
            id: part.id,
            name: part.name || 'Sans nom',
            partNumber: part.part_number || '',
            category: part.category || 'Non classé',
            manufacturer: part.supplier || '',
            compatibility: compatibility,
            stock: typeof part.quantity === 'number' ? part.quantity : 0,
            price: typeof part.unit_price === 'number' ? part.unit_price : 0,
            location: part.location || '',
            reorderPoint: typeof part.reorder_threshold === 'number' ? part.reorder_threshold : 5,
            image: part.image_url || 'https://placehold.co/400x300/png?text=No+Image'
          };
        });
      }
      
      // If still no parts found, return filtered sample data
      console.info('No parts found with any method, using filtered sample data');
      return partsData.filter((part, index) => index % 2 === 0);
    } catch (queryError) {
      console.error('Error executing Supabase query:', queryError);
      // Filter mock data to simulate compatibility
      return partsData.filter((part, index) => index % 2 === 0); 
    }
  } catch (error) {
    console.error('Error in getPartsForEquipment():', error);
    // Return filtered sample data as fallback
    return partsData.filter(part => 
      part.compatibility && 
      part.compatibility.some(equip => equip.includes(equipmentId.toString()))
    );
  }
}
