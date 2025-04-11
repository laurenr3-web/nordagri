
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that provides navigation handlers for common dashboard actions
 */
export const useNavigationHandlers = () => {
  const navigate = useNavigate();
  
  const handleStatsCardClick = useCallback((type: string) => {
    switch (type) {
      case 'Active Equipment':
        navigate('/equipment');
        break;
      case 'Maintenance Tasks':
        navigate('/maintenance');
        break;
      case 'Parts Inventory':
        navigate('/parts');
        break;
      case 'Field Interventions':
        navigate('/interventions');
        break;
      default:
        console.log(`No navigation defined for stats type: ${type}`);
    }
  }, [navigate]);

  const handleEquipmentViewAllClick = useCallback(() => {
    navigate('/equipment');
  }, [navigate]);

  const handleMaintenanceCalendarClick = useCallback(() => {
    navigate('/maintenance');
  }, [navigate]);

  const handleTasksAddClick = useCallback(() => {
    navigate('/maintenance');
  }, [navigate]);
  
  const handleEquipmentClick = useCallback((id: number) => {
    navigate(`/equipment/${id}`);
  }, [navigate]);

  const handleInterventionClick = useCallback((id: number) => {
    navigate(`/interventions?id=${id}`);
  }, [navigate]);
  
  const handlePartsViewAll = useCallback(() => {
    navigate('/parts');
  }, [navigate]);

  const handleViewCalendarEvent = useCallback((id: string | number, type: string) => {
    switch (type) {
      case 'maintenance':
      case 'task':
        navigate(`/maintenance?taskId=${id}`);
        break;
      case 'intervention':
        navigate(`/interventions?id=${id}`);
        break;
      default:
        break;
    }
  }, [navigate]);
  
  /**
   * Gestionnaire pour afficher les détails d'une intervention urgente
   */
  const handleUrgentInterventionClick = useCallback((id: number) => {
    navigate(`/interventions?id=${id}&urgent=true`);
  }, [navigate]);

  return {
    handleStatsCardClick,
    handleEquipmentViewAllClick,
    handleMaintenanceCalendarClick,
    handleTasksAddClick,
    handleEquipmentClick,
    handleInterventionClick,
    handlePartsViewAll,
    handleViewCalendarEvent,
    handleUrgentInterventionClick
  };
};
