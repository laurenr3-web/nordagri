
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { partsData } from '@/data/partsData'; // Import fallback data

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
    
    // Try a direct count query first to check if table exists and has records
    console.log('🔢 Vérification du nombre de pièces disponibles...');
    const countCheck = await supabase.from('parts_inventory').select('*', { count: 'exact', head: true });
    
    if (countCheck.error) {
      console.error('Erreur lors du comptage des pièces:', countCheck.error);
      
      // Check for specific policy-related errors
      if (countCheck.error.message.includes('infinite recursion detected in policy')) {
        console.error('⚠️ Erreur de récursion infinie détectée dans les politiques RLS. Vérifiez les politiques sur la table user_roles.');
        
        // Use local fallback data for development
        console.log('Utilisation des données locales de secours pour le développement');
        return partsData as Part[];
      }
    }
    
    console.log(`Nombre de pièces: ${countCheck.count || 'inconnu'}`);
    
    // Query parts from parts_inventory table with error handling
    // Using a simple select(*) without joins
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*');
    
    if (error) {
      console.error('Erreur Supabase détaillée:', error);
      
      // If we have a policy error, use fallback data
      if (error.message.includes('infinite recursion')) {
        console.warn('Utilisation des données de secours en raison d\'une erreur de politique');
        return partsData as Part[];
      }
      
      throw new Error(`Erreur lors de la récupération des pièces: ${error.message}`);
    }
    
    console.log(`✅ ${data?.length || 0} pièce(s) trouvée(s)`);
    
    if (!data || data.length === 0) {
      console.log('Aucune pièce trouvée dans la base de données');
      // Return empty array instead of throwing error
      return [];
    }
    
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
  } catch (error) {
    console.error('❌ Erreur critique dans getParts:', error);
    
    // In case of a critical error, use the fallback data for development
    console.warn('Utilisation des données locales de secours');
    return partsData as Part[];
  }
}
