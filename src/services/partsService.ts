
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export const createPart = async (part: Omit<Part, 'id'>) => {
  const partData = {
    name: part.name,
    part_number: part.partNumber,
    category: part.category,
    supplier: part.manufacturer,
    compatible_with: part.compatibility,
    quantity: part.stock,
    unit_price: part.price,
    location: part.location,
    reorder_threshold: part.reorderPoint
  };
  
  const { data, error } = await supabase
    .from('parts_inventory')
    .insert(partData)
    .select()
    .single();
  
  if (error) throw error;
  
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
    image: 'https://placehold.co/100x100/png'
  };
};

export const updatePart = async (part: Part) => {
  console.log('Service: Tentative de mise à jour de la pièce:', part);
  
  // Vérifiez que vous séparez bien l'ID du reste des données
  const { id, ...updateData } = part;
  
  // Mapping des données pour correspondre au schéma de la base de données
  const partData = {
    name: updateData.name,
    part_number: updateData.partNumber,
    category: updateData.category,
    supplier: updateData.manufacturer,
    compatible_with: updateData.compatibility,
    quantity: updateData.stock,
    unit_price: updateData.price,
    location: updateData.location,
    reorder_threshold: updateData.reorderPoint
  };
  
  // Log pour vérifier les données exactes envoyées à Supabase
  console.log('Service: Données envoyées à Supabase:', { id, partData });
  
  try {
    const { data, error } = await supabase
      .from('parts_inventory')
      .update(partData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Service: Erreur Supabase:', error);
      throw error;
    }
    
    console.log('Service: Réponse Supabase réussie:', data);
    
    // On retourne l'objet part complet pour avoir toutes les données
    return part;
  } catch (err) {
    console.error('Service: Exception capturée:', err);
    throw err;
  }
};

export const deletePart = async (partId: number) => {
  console.log('Service: Tentative de suppression de la pièce:', partId);
  
  try {
    const { error } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', partId);
    
    if (error) {
      console.error('Service: Erreur Supabase lors de la suppression:', error);
      throw error;
    }
    
    console.log('Service: Suppression réussie de la pièce ID:', partId);
    return partId;
  } catch (err) {
    console.error('Service: Exception capturée lors de la suppression:', err);
    throw err;
  }
};
