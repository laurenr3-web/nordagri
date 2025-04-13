
import { useNavigate } from 'react-router-dom';
import { useEquipmentData } from './detail/useEquipmentData';
import { useMaintenanceTasks } from './detail/useMaintenanceTasks';
import { useMaintenancePlans } from './detail/useMaintenancePlans';
import { useEquipmentUpdate } from './detail/useEquipmentUpdate';
import { useMaintenanceUtils } from './detail/useMaintenanceUtils';

export function useEquipmentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const { equipment, setEquipment, loading: equipmentLoading, error: equipmentError } = useEquipmentData(id);
  const { tasks: maintenanceTasks, loading: tasksLoading, error: tasksError } = useMaintenanceTasks(id);
  const { plans: maintenancePlans, loading: plansLoading, error: plansError } = useMaintenancePlans(id);
  const { handleEquipmentUpdate, loading: updateLoading } = useEquipmentUpdate(id, setEquipment);
  const { getLastMaintenanceDate, getNextServiceInfo } = useMaintenanceUtils();
  
  // Enrich equipment data with maintenance information
  if (equipment && maintenanceTasks) {
    equipment.lastMaintenance = getLastMaintenanceDate(maintenanceTasks);
    equipment.usage = {
      hours: equipment.current_hours || 0,
      target: equipment.usage_target || 500
    };
    equipment.nextService = getNextServiceInfo(maintenanceTasks);
  }
  
  const loading = equipmentLoading || tasksLoading || plansLoading || updateLoading;
  const error = equipmentError || tasksError || plansError;
  
  return { 
    equipment, 
    maintenanceTasks,
    maintenancePlans,
    loading, 
    error, 
    handleEquipmentUpdate 
  };
}
