
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from './types';
import { mapEquipmentToDatabase, mapEquipmentFromDatabase } from './mappers';

/**
 * Ajoute un nouvel équipement
 */
export async function addEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
  try {
    // Vérification des champs requis
    if (!equipment.name) {
      throw new Error('Le nom de l\'équipement est requis');
    }
    
    // Récupérer l'ID de l'utilisateur connecté
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Préparation des données pour la base de données
    const dbEquipment = {
      ...mapEquipmentToDatabase(equipment),
      owner_id: sessionData.session.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insertion dans la base de données
    const { data, error } = await supabase
      .from('equipment')
      .insert(dbEquipment)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
    
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error('Error in addEquipment:', error);
    throw error;
  }
}

/**
 * Met à jour un équipement existant
 */
export async function updateEquipment(equipment: Equipment): Promise<Equipment> {
  try {
    // Vérification des champs requis
    if (!equipment.id) {
      throw new Error('L\'ID de l\'équipement est requis pour la mise à jour');
    }
    if (!equipment.name) {
      throw new Error('Le nom de l\'équipement est requis');
    }
    
    console.log('Updating equipment with data:', equipment);
    
    // Préparation des données pour la base de données
    const dbEquipment = {
      ...mapEquipmentToDatabase(equipment),
      updated_at: new Date()
    };
    
    // Mise à jour dans la base de données
    const { data, error } = await supabase
      .from('equipment')
      .update(dbEquipment)
      .eq('id', equipment.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
    
    console.log('Update successful, received data:', data);
    return mapEquipmentFromDatabase(data);
  } catch (error) {
    console.error('Error in updateEquipment:', error);
    throw error;
  }
}

/**
 * Supprime un équipement
 */
export async function deleteEquipment(id: number | string): Promise<void> {
  try {
    // Ensure we have a valid numeric ID
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(numericId)) {
      throw new Error(`Invalid equipment ID: ${id}`);
    }
    
    console.log(`Attempting to delete equipment with ID: ${numericId}`);
    
    // Vérifier si l'utilisateur est authentifié
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Supprimer d'abord les références dans les tables liées
    // 1. Supprimer les entrées de maintenance liées
    const { error: maintenanceError } = await supabase
      .from('equipment_maintenance_schedule')
      .delete()
      .eq('equipment_id', numericId);
      
    if (maintenanceError) {
      console.error(`Error deleting maintenance records for equipment ${numericId}:`, maintenanceError);
      // Continue avec la suppression d'équipement même si la suppression des tâches échoue
    }
    
    // 2. Supprimer les codes QR liés à cet équipement
    const { error: qrError } = await supabase
      .from('equipment_qrcodes')
      .delete()
      .eq('equipment_id', numericId);
      
    if (qrError) {
      console.error(`Error deleting QR codes for equipment ${numericId}:`, qrError);
      // Continue avec la suppression d'équipement même si la suppression des QR échoue
    }
    
    // 3. Supprimer les logs d'équipement liés
    const { error: logsError } = await supabase
      .from('equipment_logs')
      .delete()
      .eq('equipment_id', numericId);
      
    if (logsError) {
      console.error(`Error deleting logs for equipment ${numericId}:`, logsError);
      // Continue avec la suppression d'équipement même si la suppression des logs échoue
    }
    
    // Maintenant supprimer l'équipement lui-même
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', numericId);
    
    if (error) {
      console.error(`Error deleting equipment with ID ${numericId}:`, error);
      throw error;
    }
    
    console.log(`Successfully deleted equipment with ID: ${numericId}`);
  } catch (error) {
    console.error('Error in deleteEquipment:', error);
    throw error;
  }
}

/**
 * Ajoute une tâche de maintenance pour un équipement
 */
export async function addMaintenanceTask(equipmentId: number, task: {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: string;
}) {
  try {
    // Conversion de Date en string ISO pour Supabase
    const dueDateString = task.dueDate ? task.dueDate.toISOString() : null;
    
    const { data, error } = await supabase
      .from('equipment_maintenance_schedule')
      .insert({
        equipment_id: equipmentId,
        title: task.title,
        description: task.description,
        due_date: dueDateString,
        priority: task.priority || 'medium'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding maintenance task:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in addMaintenanceTask:', error);
    throw error;
  }
}
