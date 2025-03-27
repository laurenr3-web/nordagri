
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export const partsService = {
  // Fetch all parts from the database
  async getParts(): Promise<Part[]> {
    console.log('🔍 Fetching all parts from Supabase...');
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*');
    
    if (error) {
      console.error('Error fetching parts:', error);
      throw error;
    }
    
    // Convert database records to Part objects
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
      image: part.image_url || 'https://placehold.co/100x100/png'
    }));
  },
  
  // Fetch parts that are compatible with a specific equipment
  async getPartsForEquipment(equipmentId: number): Promise<Part[]> {
    console.log(`🔍 Fetching parts compatible with equipment ID ${equipmentId}...`);
    
    // First, get equipment details to check the name or model
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('name, model, manufacturer')
      .eq('id', equipmentId)
      .single();
    
    if (equipmentError) {
      console.error('Error fetching equipment:', equipmentError);
      throw equipmentError;
    }
    
    if (!equipmentData) {
      throw new Error(`Equipment with ID ${equipmentId} not found`);
    }
    
    // Create search terms based on equipment data
    const searchTerms = [
      equipmentData.name, 
      equipmentData.model, 
      `${equipmentData.manufacturer} ${equipmentData.model}`
    ].filter(Boolean);
    
    // Fetch parts that have any of these terms in their compatibility array
    const { data, error } = await supabase
      .from('parts_inventory')
      .select('*');
    
    if (error) {
      console.error('Error fetching compatible parts:', error);
      throw error;
    }
    
    // Filter parts where compatibility array contains any of the search terms
    // or where the equipment ID is directly in the compatibility array
    const compatibleParts = (data || []).filter(part => {
      if (!part.compatible_with) return false;
      
      // Check if equipment ID is in compatibility array as a number or string
      const hasEquipmentId = part.compatible_with.some(
        (item: any) => item === equipmentId || item === equipmentId.toString()
      );
      
      // Check if any search term is in compatibility array
      const hasCompatibleTerm = searchTerms.some(term => 
        term && part.compatible_with.some(
          (item: string) => typeof item === 'string' && item.toLowerCase().includes(term.toLowerCase())
        )
      );
      
      return hasEquipmentId || hasCompatibleTerm;
    });
    
    // Convert database records to Part objects
    return compatibleParts.map(part => ({
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
      image: part.image_url || 'https://placehold.co/100x100/png'
    }));
  },
  
  // Add a new part to the database
  async addPart(part: Omit<Part, 'id'>): Promise<Part> {
    console.log('➕ Adding new part:', part);
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
    
    if (error) {
      console.error('Error adding part:', error);
      throw error;
    }
    
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
  },
  
  // Update an existing part in the database
  async updatePart(part: Part): Promise<Part> {
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
  },
  
  // Delete a part from the database
  async deletePart(partId: number): Promise<void> {
    console.log('🗑️ Deleting part with ID:', partId);
    const { error } = await supabase
      .from('parts_inventory')
      .delete()
      .eq('id', partId);
    
    if (error) {
      console.error('Error deleting part:', error);
      throw error;
    }
  }
};

// Add individual function exports for direct imports
export const { getParts, addPart, updatePart, deletePart, getPartsForEquipment } = partsService;

// Explicitly expose for browser console testing
if (typeof window !== 'undefined') {
  (window as any).partsService = partsService;
}
