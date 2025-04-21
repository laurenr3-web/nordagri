
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData';

export async function getParts(): Promise<Part[]> {
  console.log('🔍 Fetching all parts from Supabase parts_inventory table...');
  
  try {
    // (Removed pg_policies debug logic)
    
    // Get the current user ID from the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      throw new Error('Erreur de récupération de session');
    }
    
    const userId = sessionData.session?.user?.id;
    
    // If user is not authenticated, handle gracefully
    if (!userId) {
      console.warn('❓ Utilisateur non authentifié, tentative de récupération des pièces sans authentification');
      
      // Try to query anyway (might work if there are permissive RLS policies)
      const { data, error } = await supabase
        .from('parts_inventory')
        .select('*');
        
      if (error) {
        console.error('❌ Erreur Supabase (utilisateur non authentifié):', error);
        
        // En mode développement, retourner des données fictives pour faciliter le développement
        if (import.meta.env.DEV) {
          console.warn('⚠️ MODE DEV: Retour de données fictives pour permettre le développement');
          return transformPartsData(partsData);
        }
        
        throw error;
      }
      
      return transformPartsData(data || []);
    }
    
    console.log(`👤 Récupération des pièces pour l'utilisateur: ${userId}`);
    
    // Get user's profile to check farm_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('farm_id')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.warn('⚠️ Profil non trouvé pour cet utilisateur:', profileError);
    } else if (profileData && profileData.farm_id) {
      console.log(`👨‍🌾 Farm ID de l'utilisateur: ${profileData.farm_id}`);
    } else {
      console.warn('⚠️ L\'utilisateur n\'a pas de farm_id dans son profil');
    }
    
    // Tenter de récupérer toutes les pièces avec debug
    console.log('🔍 Tentative de requête de toutes les pièces...');
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*');
      
    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw new Error(`Erreur lors de la récupération des pièces: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ Aucune pièce trouvée dans la base de données');
      return [];
    }
    
    console.log(`✅ ${data.length} pièce(s) trouvée(s)`, data);
    
    return transformPartsData(data);
  } catch (error) {
    console.error('❌ Erreur critique dans getParts:', error);
    throw error;
  }
}

function transformPartsData(data: any[]): Part[] {
  console.log('🔄 Transformation des données parts_inventory en objets Part...');
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
