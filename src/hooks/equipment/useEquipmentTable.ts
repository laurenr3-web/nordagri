
// Fix the specific lines with string/number type mismatches
// We need to add type assertions or conversions

export const deleteEquipment = async (id: string | number): Promise<void> => {
  try {
    // Convert id to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await supabase.from('equipment').delete().eq('id', numericId);
    toast.success("Équipement supprimé avec succès");
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    toast.error("Erreur lors de la suppression de l'équipement");
    throw error;
  }
};

export const createMaintenancePlan = async (equipmentId: string | number, plan: any): Promise<void> => {
  try {
    // Convert equipmentId to number if it's a string
    const numericId = typeof equipmentId === 'string' ? parseInt(equipmentId, 10) : equipmentId;
    
    const planData = {
      ...plan,
      equipment_id: numericId
    };
    
    await supabase.from('maintenance_plans').insert(planData);
    toast.success("Plan de maintenance créé avec succès");
  } catch (error: any) {
    console.error('Error creating maintenance plan:', error);
    toast.error("Erreur lors de la création du plan de maintenance");
    throw error;
  }
};
