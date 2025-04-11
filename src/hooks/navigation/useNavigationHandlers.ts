
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Types d'éléments pour lesquels la navigation est prise en charge
 */
export type NavigationItemType = 'equipment' | 'maintenance' | 'parts' | 'intervention' | 'urgent-intervention' | 'task' | 'calendar-event';

/**
 * Type pour un ID d'élément (peut être un nombre ou une chaîne)
 */
export type ItemId = number | string;

/**
 * Interface pour les options de navigation calendrier
 */
export interface CalendarEventNavOptions {
  id: ItemId;
  type: 'maintenance' | 'task' | 'intervention';
}

/**
 * Hook personnalisé qui fournit des gestionnaires de navigation optimisés pour les actions du tableau de bord
 */
export const useNavigationHandlers = () => {
  const navigate = useNavigate();
  
  /**
   * Naviguer vers une section basée sur le type de carte statistique
   */
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

  /**
   * Naviguer vers la liste complète des équipements
   */
  const handleEquipmentViewAllClick = useCallback(() => {
    navigate('/equipment');
  }, [navigate]);

  /**
   * Naviguer vers le calendrier de maintenance
   */
  const handleMaintenanceCalendarClick = useCallback(() => {
    navigate('/maintenance');
  }, [navigate]);

  /**
   * Naviguer vers la page d'ajout de tâches de maintenance
   */
  const handleTasksAddClick = useCallback(() => {
    navigate('/maintenance');
  }, [navigate]);
  
  /**
   * Naviguer vers la page de détail d'un équipement
   */
  const handleEquipmentClick = useCallback((id: number) => {
    navigate(`/equipment/${id}`);
  }, [navigate]);

  /**
   * Naviguer vers la page de détail d'une intervention
   */
  const handleInterventionClick = useCallback((id: number) => {
    navigate(`/interventions?id=${id}`);
  }, [navigate]);
  
  /**
   * Naviguer vers la liste complète des pièces
   */
  const handlePartsViewAll = useCallback(() => {
    navigate('/parts');
  }, [navigate]);

  /**
   * Naviguer vers un événement calendrier selon son type
   */
  const handleViewCalendarEvent = useCallback((id: ItemId, type: string) => {
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
   * Naviguer vers les détails d'une intervention urgente
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
