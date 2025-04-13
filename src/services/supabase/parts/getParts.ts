
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData';

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
    
    console.log(`Found ${data?.length || 0} parts for user ${userId}`);
    
    if (!data || data.length === 0) {
      console.info('No parts found, using sample parts data');
      return partsData;
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
    console.error('Error in getParts():', error);
    console.info('Using sample parts data as fallback due to error');
    // Return sample data as fallback
    return partsData;
  }
}
