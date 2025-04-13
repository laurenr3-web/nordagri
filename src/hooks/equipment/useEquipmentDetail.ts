
import { useNavigate } from 'react-router-dom';
import { useEquipmentData } from './detail/useEquipmentData';
import { useMaintenanceTasks } from './detail/useMaintenanceTasks';
import { useMaintenancePlans } from './detail/useMaintenancePlans';
import { useEquipmentUpdate } from './detail/useEquipmentUpdate';
import { useMaintenanceUtils } from './detail/useMaintenanceUtils';

export function useEquipmentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const { equipment, setEquipment, loading, error } = useEquipmentData(id);
  const { tasks: maintenanceTasks } = useMaintenanceTasks(id);
  const { plans: maintenancePlans } = useMaintenancePlans(id);
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
