
import { supabase } from '@/integrations/supabase/client';

/**
 * Récupère l'historique de maintenance d'un équipement
 */
export async function getEquipmentMaintenanceHistory(equipmentId: number) {
  try {
    const { data, error } = await supabase
      .from('equipment_maintenance_schedule')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('due_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching equipment maintenance history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getEquipmentMaintenanceHistory (${equipmentId}):`, error);
    throw error;
  }
}

/**
 * Récupère les tâches de maintenance pour un équipement spécifique
 */
export async function getEquipmentMaintenanceTasks(equipmentId: number) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    console.log(`Fetching maintenance tasks for equipment ${equipmentId} (User: ${userId})`);
    
    // Récupérer les tâches de maintenance pour cet équipement
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching equipment maintenance tasks:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} maintenance tasks for equipment ${equipmentId}`);
    return data || [];
  } catch (error) {
    console.error(`Error in getEquipmentMaintenanceTasks (${equipmentId}):`, error);
    throw error;
  }
}

/**
 * Récupère les statistiques de maintenance pour un équipement
 */
export async function getEquipmentMaintenanceStats(equipmentId: number) {
  try {
    // Récupérer les tâches de maintenance
    const tasks = await getEquipmentMaintenanceTasks(equipmentId);
    
    // Calculer les statistiques
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const upcoming = tasks.filter(task => 
      task.status !== 'completed' && new Date(task.due_date) > new Date()
    ).length;
    const overdue = tasks.filter(task => 
      task.status !== 'completed' && new Date(task.due_date) < new Date()
    ).length;
    
    // Calculer les heures totales
    const totalHours = tasks.reduce((sum, task) => {
      return sum + (task.actual_duration || task.estimated_duration || 0);
    }, 0);
    
    return {
      total,
      completed,
      upcoming,
      overdue,
      totalHours,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  } catch (error) {
    console.error(`Error in getEquipmentMaintenanceStats (${equipmentId}):`, error);
    throw error;
  }
}
