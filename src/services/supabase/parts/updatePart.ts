
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export async function updatePart(part: Part): Promise<Part> {
  console.log('🔄 Début de la mise à jour de pièce avec ID:', part.id, 'Type:', typeof part.id, 'Données:', part);
  
  // Assurons-nous que l'ID est un nombre valide
  const numericId = typeof part.id === 'string' ? parseInt(part.id) : part.id;
  
  if (isNaN(numericId)) {
    throw new Error(`ID invalide: ${part.id}`);
  }
  
  // Structure correcte pour Supabase
  const partData = {
    name: part.name,
    part_number: part.partNumber,
    category: part.category,
    supplier: part.manufacturer,
    compatible_with: part.compatibility,
    quantity: part.stock,
    unit_price: part.price,
    location: part.location,
    reorder_threshold: part.reorderPoint,
    updated_at: new Date().toISOString()
  };
  
  try {
    console.log('🚀 Envoi de la requête de mise à jour à Supabase pour ID:', numericId, 'Données:', partData);
    
    const { data, error } = await supabase
      .from('parts_inventory')
      .update(partData)
      .eq('id', numericId)
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Erreur Supabase lors de la mise à jour:', error);
      throw error;
    }
    
    if (!data) {
      console.error('❌ Aucune donnée retournée après la mise à jour');
      throw new Error('Aucune donnée retournée après la mise à jour');
    }
    
    console.log('✅ Mise à jour Supabase réussie, réponse:', data);
    
    // Retourner la pièce mise à jour avec tous les champs
    return {
      id: data.id,
      name: data.name,
      partNumber: data.part_number || '',
      category: data.category || '',
      manufacturer: data.supplier || '',
      compatibility: data.compatible_with || [],
      stock: data.quantity,
      price: data.unit_price !== null ? data.unit_price : 0,
      location: data.location || '',
      reorderPoint: data.reorder_threshold || 5,
      image: part.image || 'https://placehold.co/100x100/png'
    };
  } catch (err) {
    console.error('💥 Exception dans updatePart:', err);
    throw err;
  }
}
