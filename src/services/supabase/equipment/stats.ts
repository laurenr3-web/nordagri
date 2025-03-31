
import { supabase } from '@/integrations/supabase/client';
import { EquipmentStats } from './types';

/**
 * Récupère les statistiques des équipements
 */
export async function getEquipmentStats(): Promise<EquipmentStats> {
  try {
    // Récupérer tous les équipements
    const { data, error } = await supabase
      .from('equipment')
      .select('status, category, type');
    
    if (error) {
      console.error('Error fetching equipment stats:', error);
      throw error;
    }
    
    // Initialiser les statistiques
    const stats: EquipmentStats = {
      total: data.length,
      operational: 0,
      maintenance: 0,
      repair: 0,
      inactive: 0,
      byCategory: {},
      byType: {}
    };
    
    // Calculer les statistiques
    data.forEach(item => {
      // Statut
      switch (item.status) {
        case 'operational':
          stats.operational++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
        case 'repair':
          stats.repair++;
          break;
        case 'inactive':
          stats.inactive++;
          break;
      }
      
      // Catégorie
      if (item.category) {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      }
      
      // Type
      if (item.type) {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error in getEquipmentStats:', error);
    throw error;
  }
}
