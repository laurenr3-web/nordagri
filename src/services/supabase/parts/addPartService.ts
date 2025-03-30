
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

/**
 * Ajoute une nouvelle pièce à l'inventaire
 * 
 * @param part Les données de la pièce à ajouter (sans ID)
 * @returns Promise résolvant à la pièce ajoutée avec son ID
 */
export async function addPart(part: Omit<Part, 'id'>): Promise<Part> {
  console.log("📝 Tentative d'ajout de pièce:", part);
  
  try {
    // Récupération de l'ID utilisateur actuel
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error("Vous devez être connecté pour ajouter une pièce");
    }
    
    // Validation des données obligatoires
    if (!part.name) {
      throw new Error("Le nom de la pièce est obligatoire");
    }
    
    // Formatage pour la structure de la table Supabase
    const supabasePart = {
      name: part.name,
      part_number: part.partNumber || part.reference || '',
      category: part.category || 'Non catégorisé',
      supplier: part.manufacturer || '',
      compatible_with: Array.isArray(part.compatibility) 
        ? part.compatibility 
        : Array.isArray(part.compatibleWith) 
          ? part.compatibleWith 
          : [],
      quantity: Number(part.stock || part.quantity || 0),
      unit_price: part.price ? Number(part.price) : 0,
      location: part.location || '',
      reorder_threshold: Number(part.reorderPoint || part.minimumStock || 5),
      image_url: part.image || part.imageUrl || null,
      owner_id: userId // Ajout de l'ID utilisateur comme propriétaire
    };
    
    console.log("🧩 Données formatées pour Supabase:", supabasePart);
    
    // Insertion avec récupération des données insérées
    const { data, error, status } = await supabase
      .from('parts_inventory')
      .insert(supabasePart)
      .select('*')
      .single();
      
    if (error) {
      console.error("❌ Erreur Supabase lors de l'ajout:", error);
      console.error("Code de statut HTTP:", status);
      
      // Messages d'erreur spécifiques basés sur les codes d'erreur Supabase
      if (error.code === '23505') {
        throw new Error("Une pièce avec cette référence existe déjà");
      } else if (error.code === '23502') {
        throw new Error("Certains champs obligatoires sont manquants");
      } else if (error.code === '42501') {
        throw new Error("Vous n'avez pas les permissions nécessaires pour ajouter une pièce");
      } else {
        throw new Error(`Erreur lors de l'ajout: ${error.message || "Problème inconnu"}`);
      }
    }
    
    if (!data) {
      throw new Error("La pièce a été ajoutée mais aucune donnée n'a été retournée");
    }
    
    console.log("✅ Pièce ajoutée avec succès:", data);
    
    // Convertir les données retournées au format Part
    const addedPart: Part = {
      id: data.id,
      name: data.name,
      partNumber: data.part_number || '',
      reference: data.part_number || '',
      category: data.category || '',
      manufacturer: data.supplier || '',
      compatibility: data.compatible_with || [],
      compatibleWith: data.compatible_with || [],
      stock: data.quantity,
      quantity: data.quantity,
      price: data.unit_price || 0,
      location: data.location || '',
      reorderPoint: data.reorder_threshold || 5,
      minimumStock: data.reorder_threshold || 5,
      image: data.image_url || 'https://placehold.co/100x100/png',
      imageUrl: data.image_url || null
    };
    
    return addedPart;
  } catch (err: any) {
    console.error("❌ Exception lors de l'ajout de la pièce:", err);
    
    // Si l'erreur vient de Supabase, elle est déjà formatée, sinon on l'enveloppe
    if (err.code && err.message) {
      throw err;
    } else {
      throw new Error(err.message || "Une erreur est survenue lors de l'ajout de la pièce");
    }
  }
}
