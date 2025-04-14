
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData';
import { toast } from 'sonner';

export async function getPartsForEquipment(equipmentId: number | string): Promise<Part[]> {
  console.log(`🔍 Fetching parts for equipment ID: ${equipmentId}`);
  
  try {
    // Get the current user ID from the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      console.info('Returning demo parts data due to session error');
      toast.info("Utilisation de données de démonstration pour les pièces");
      return partsData.filter((part, index) => index % 2 === 0);
    }
    
    const userId = sessionData.session?.user.id;
    
    // If user is not authenticated, return mock data
    if (!userId) {
      console.warn('User not authenticated, returning filtered sample parts data');
      toast.info("Utilisateur non authentifié - données de démonstration utilisées");
      return partsData.filter((part, index) => index % 2 === 0); // Return a subset of parts as an example
    }
    
    console.log(`Looking for parts compatible with equipment ${equipmentId} for user ${userId}`);
    
    try {
      // Attempt to get compatible parts (direct approach)
      const compatibleParts = await fetchCompatibleParts(userId, equipmentId);
      
      // If we have compatible parts, return them
      if (compatibleParts && compatibleParts.length > 0) {
        console.log(`Found ${compatibleParts.length} compatible parts for equipment ${equipmentId}`);
        return compatibleParts;
      }
      
      console.info('No compatible parts found in database, returning demo data');
      toast.info("Aucune pièce compatible trouvée - données de démonstration utilisées");
      return partsData.filter((_, index) => index % 3 === 0);
      
    } catch (queryError) {
      console.error('Error executing parts query:', queryError);
      console.info('Returning demo parts data due to query error');
      toast.error("Erreur lors de la recherche de pièces - données de démonstration utilisées");
      return partsData.filter((_, index) => index % 2 === 0);
    }
  } catch (error) {
    console.error('Error in getPartsForEquipment():', error);
    console.info('Returning demo parts data due to general error');
    toast.error("Erreur générale - données de démonstration utilisées");
    return partsData.filter((part) => 
      part.compatibility && 
      part.compatibility.some(equip => equip.includes(equipmentId.toString()))
    );
  }
}

// Helper function to fetch compatible parts
async function fetchCompatibleParts(userId: string, equipmentId: number | string): Promise<Part[]> {
  try {
    // First attempt - using contains operator for compatibility array
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*')
      .eq('owner_id', userId)
      .filter('compatible_with', 'cs', `{${equipmentId}}`);
    
    if (error) {
      console.error('Error fetching parts for equipment (method 1):', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(mapPartFromDatabase);
    }
    
    // Second attempt - using text search
    const { data: altData, error: altError } = await supabase
      .from('parts_inventory')
      .select('*')
      .eq('owner_id', userId)
      .textSearch('compatible_with', equipmentId.toString());
    
    if (altError) {
      console.error('Error fetching parts for equipment (method 2):', altError);
      throw altError;
    }
    
    if (altData && altData.length > 0) {
      return altData.map(mapPartFromDatabase);
    }
    
    // No parts found with either method
    return [];
  } catch (error) {
    console.error('Error in fetchCompatibleParts():', error);
    throw error;
  }
}

// Helper function to map database part to Part type
function mapPartFromDatabase(part: any): Part {
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
}
