
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData';
import { convertToCamelCase } from '@/utils/typeTransformers';

export async function getParts(): Promise<Part[]> {
  console.log('🔍 Fetching all parts from Supabase...');
  
  try {
    // Get the current user ID from the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return partsData;
    }
    
    const userId = sessionData.session?.user.id;
    
    // If user is not authenticated, return mock data
    if (!userId) {
      console.warn('User not authenticated, returning sample parts data');
      return partsData;
    }
    
    console.log(`Authenticated user ID: ${userId}, attempting to fetch parts`);
    
    // Query only parts owned by the current user
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*')
      .eq('owner_id', userId);
    
    if (error) {
      console.error('Error fetching parts:', error);
      console.info('Using sample parts data as fallback');
      return partsData; // Return sample data as fallback
    }
    
    console.log(`Found ${data?.length || 0} parts in database for user ${userId}`);
    
    if (!data || data.length === 0) {
      console.info('No parts found, using sample parts data');
      return partsData;
    }
    
    // Log raw data for debugging
    console.log('Raw parts data from Supabase:', JSON.stringify(data.slice(0, 2)));
    
    // Convert database records to Part objects with better error handling
    const mappedParts = data.map(part => {
      try {
        // Handle compatibility array which might be stored as string
        let compatibility = part.compatible_with || [];
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
        
        // Create Part object with defensive coding
        const mappedPart: Part = {
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
        
        return mappedPart;
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
    
    console.log(`Successfully mapped ${mappedParts.length} parts`);
    return mappedParts;
    
  } catch (error) {
    console.error('Unexpected error in getParts():', error);
    console.info('Using sample parts data as fallback due to error');
    // Return sample data as fallback
    return partsData;
  }
}
