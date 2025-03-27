
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from './types';
import { mapEquipmentToDatabase, mapEquipmentFromDatabase } from './mappers';
import { uploadEquipmentImage } from './utils';

// Add new equipment with image upload support
export async function addEquipment(equipment: Omit<Equipment, 'id'>, imageFile?: File): Promise<Equipment> {
  let imagePath = equipment.image;
  
  // Upload image if provided
  if (imageFile) {
    imagePath = await uploadEquipmentImage(imageFile);
  }
  
  // Create a copy of the equipment object without the image property
  const { image, ...equipmentWithoutImage } = equipment;
  
  // Convert to database format
  const equipmentData = mapEquipmentToDatabase(equipmentWithoutImage);
  
  const { data, error } = await supabase
    .from('equipment')
    .insert(equipmentData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding equipment:', error);
    throw error;
  }
  
  // Return the equipment with the image included in the response
  return {
    ...mapEquipmentFromDatabase(data),
    image: imagePath
  };
}

// Update equipment with image upload support
export async function updateEquipment(equipment: Equipment, imageFile?: File): Promise<Equipment> {
  let imagePath = equipment.image;
  
  // Upload image if provided
  if (imageFile) {
    imagePath = await uploadEquipmentImage(imageFile);
  }
  
  // Separate image from data to be sent to the database
  const { image, ...equipmentWithoutImage } = equipment;
  
  const equipmentData = mapEquipmentToDatabase(equipmentWithoutImage);
  
  const { error } = await supabase
    .from('equipment')
    .update(equipmentData)
    .eq('id', equipment.id);
  
  if (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
  
  return {
    ...equipment,
    image: imagePath
  };
}

// Delete equipment
export async function deleteEquipment(equipmentId: number): Promise<void> {
  // First attempt to get the image path
  const { data: equipment } = await supabase
    .from('equipment')
    .select('image')
    .eq('id', equipmentId)
    .single();
  
  // Delete the equipment record
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', equipmentId);
  
  if (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
  
  // TODO: Add storage bucket integration for deleting images
  // if (equipment?.image && equipment.image.startsWith('equipment/')) {
  //   await deleteEquipmentImage(equipment.image);
  // }
}
