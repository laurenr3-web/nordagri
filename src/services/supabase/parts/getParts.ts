
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function getParts(): Promise<Part[]> {
  console.log('🔍 Fetching all parts from Supabase parts_inventory table...');
  
  try {
    // Get the current user ID from the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      throw new Error('Erreur de récupération de session');
    }
    
    const userId = sessionData.session?.user?.id;
    
    // If user is not authenticated, handle gracefully
    if (!userId) {
      console.warn('Utilisateur non authentifié, retourne un tableau de pièces vide');
      return [];
    }
    
    console.log(`👤 Récupération des pièces pour l'utilisateur: ${userId}`);
    
    // Query only parts owned by the current user from parts_inventory table
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*')
      .eq('owner_id', userId);
    
    if (error) {
      console.error('Erreur lors de la récupération des pièces:', error);
      throw error;
    }
    
    console.log(`✅ ${data?.length || 0} pièce(s) trouvée(s) pour l'utilisateur ${userId}`);
    console.log('Données brutes des pièces:', data);
    
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
  } catch (error) {
    console.error('❌ Erreur critique dans getParts:', error);
    throw new Error(`Impossible de récupérer les pièces: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}
