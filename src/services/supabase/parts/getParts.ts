
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData';

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
    
    // Get user's farm_id from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('farm_id')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      // Fall back to using owner_id (for backward compatibility)
      const { data: partsData, error: partsError } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('owner_id', userId);
        
      if (partsError) {
        console.error('Erreur Supabase:', partsError);
        throw new Error(`Erreur lors de la récupération des pièces: ${partsError.message}`);
      }
      
      return transformPartsData(partsData || []);
    }
    
    const farmId = profileData?.farm_id;
    
    // If farm_id is available, query by farm_id, otherwise fall back to owner_id
    let query = supabase
      .from('parts_inventory')
      .select('*');
      
    if (farmId) {
      console.log(`👨‍🌾 Récupération des pièces pour la ferme: ${farmId}`);
      query = query.eq('farm_id', farmId);
    } else {
      console.log('⚠️ Aucune ferme associée, récupération des pièces par owner_id');
      query = query.eq('owner_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur Supabase:', error);
      throw new Error(`Erreur lors de la récupération des pièces: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('Aucune pièce trouvée dans la base de données');
      return [];
    }
    
    console.log(`✅ ${data.length} pièce(s) trouvée(s)`);
    
    return transformPartsData(data);
  } catch (error) {
    console.error('❌ Erreur critique dans getParts:', error);
    throw error;
  }
}

function transformPartsData(data: any[]): Part[] {
  // Map the database fields to our Part interface
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
}
