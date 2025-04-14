
import { useNavigate } from 'react-router-dom';
import { useEquipmentData } from './detail/useEquipmentData';
import { useMaintenanceTasks } from './detail/useMaintenanceTasks';
import { useMaintenancePlans } from './detail/useMaintenancePlans';
import { useEquipmentUpdate } from './detail/useEquipmentUpdate';
import { useMaintenanceUtils } from './detail/useMaintenanceUtils';
import { useEquipmentParts } from '@/hooks/parts/useEquipmentParts';

export function useEquipmentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const { equipment, setEquipment, loading: equipmentLoading, error: equipmentError } = useEquipmentData(id);
  const { tasks: maintenanceTasks, loading: tasksLoading, error: tasksError } = useMaintenanceTasks(id);
  const { plans: maintenancePlans, loading: plansLoading, error: plansError } = useMaintenancePlans(id);
  const { handleEquipmentUpdate, loading: updateLoading } = useEquipmentUpdate(id, setEquipment);
  const { getLastMaintenanceDate, getNextServiceInfo } = useMaintenanceUtils();
  const { parts: equipmentParts, loading: partsLoading, error: partsError } = useEquipmentParts(id);
  
  // Enrich equipment data with maintenance information
  if (equipment && maintenanceTasks) {
    equipment.lastMaintenance = getLastMaintenanceDate(maintenanceTasks);
    equipment.usage = {
      hours: equipment.current_hours || 0,
      target: equipment.usage_target || 500
    };
    equipment.nextService = getNextServiceInfo(maintenanceTasks);
    
    // Add parts information to equipment
    if (equipmentParts) {
      equipment.parts = equipmentParts;
      equipment.partsCount = equipmentParts.length;
    }
  }
  
  const loading = equipmentLoading || tasksLoading || plansLoading || updateLoading || partsLoading;
  const error = equipmentError || tasksError || plansError || partsError;
  
  return { 
    equipment, 
    maintenanceTasks,
    maintenancePlans,
    equipmentParts,
    loading, 
    error, 
    handleEquipmentUpdate 
  };
}
