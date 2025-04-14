
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function getParts(): Promise<Part[]> {
  console.log('🔍 Fetching all parts from Supabase parts_inventory table...');
  
  // Get the current user ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  // If user is not authenticated, return empty array
  if (!userId) {
    console.warn('User not authenticated, returning empty parts array');
    return [];
  }
  
  // Query only parts owned by the current user from parts_inventory table
  const { data, error } = await supabase
    .from('parts_inventory')
    .select('*')
    .eq('owner_id', userId);
  
  if (error) {
    console.error('Error fetching parts:', error);
    throw error;
  }
  
  console.log(`Found ${data?.length || 0} parts for user ${userId}`);
  console.log('Raw parts data:', data);
  
  // Map the database fields to our Part interface
  return (data || []).map(part => ({
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
}
