
import { useNavigate } from 'react-router-dom';
import { useEquipmentData } from './detail/useEquipmentData';
import { useMaintenanceTasks } from './detail/useMaintenanceTasks';
import { useMaintenancePlans } from './detail/useMaintenancePlans';
import { useEquipmentUpdate } from './detail/useEquipmentUpdate';
import { useMaintenanceUtils } from './detail/useMaintenanceUtils';

/**
 * Hook principal pour la page de détail d'un équipement
 * 
 * Agrège les données détaillées d'un équipement, ses tâches de maintenance,
 * ses plans de maintenance et les fonctions de mise à jour.
 * 
 * @param {string | undefined} id - L'identifiant de l'équipement
 * @returns {Object} Données complètes et fonctions pour la page de détail
 */
export function useEquipmentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const { equipment, setEquipment, loading, error } = useEquipmentData(id);
  const { maintenanceTasks } = useMaintenanceTasks(id, equipment);
  const { maintenancePlans } = useMaintenancePlans(id, equipment);
  const { handleEquipmentUpdate, loading: updateLoading } = useEquipmentUpdate(id, setEquipment);
  const { getLastMaintenanceDate, getNextServiceInfo } = useMaintenanceUtils();
  
  // Enrichir les données d'équipement avec des informations de maintenance
  if (equipment && maintenanceTasks) {
    equipment.lastMaintenance = getLastMaintenanceDate(maintenanceTasks);
    equipment.usage = {
      hours: equipment.current_hours || 0,
      target: equipment.usage_target || 500
    };
    equipment.nextService = getNextServiceInfo(maintenanceTasks);
  }
  
  return { 
    equipment, 
    maintenanceTasks,
    maintenancePlans,
    loading: loading || updateLoading, 
    error, 
    handleEquipmentUpdate 
  };
}
