
import { useState, useEffect, useCallback } from 'react';
import { WidgetConfig } from './useDashboardLayout';
import { useDashboardData } from './useDashboardData';

export const useWidgetData = (widgets: WidgetConfig[], activeView: string) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  // Utilise le hook existant pour récupérer toutes les données
  const dashboardData = useDashboardData();

  const refetch = useCallback(async () => {
    // Force un refetch des données
    window.location.reload();
  }, []);

  useEffect(() => {
    const widgetData: Record<string, any> = {};
    const widgetLoading: Record<string, boolean> = {};

    widgets.forEach(widget => {
      widgetLoading[widget.id] = dashboardData.loading;
      
      switch (widget.type) {
        case 'stats':
          widgetData[widget.id] = {
            activeEquipment: dashboardData.equipmentData?.length || 0,
            maintenanceTasks: {
              total: dashboardData.maintenanceEvents?.length || 0,
              highPriority: dashboardData.maintenanceEvents?.filter(e => e.priority === 'high').length || 0
            },
            partsInventory: {
              total: dashboardData.stockAlerts?.length || 0,
              lowStock: dashboardData.stockAlerts?.filter(s => s.percentRemaining < 20).length || 0
            },
            fieldInterventions: dashboardData.urgentInterventions?.length || 0
          };
          break;
        case 'equipment':
          widgetData[widget.id] = dashboardData.equipmentData;
          break;
        case 'alerts':
          widgetData[widget.id] = dashboardData.alertItems;
          break;
        case 'maintenance':
          widgetData[widget.id] = dashboardData.maintenanceEvents;
          break;
        case 'tasks':
          widgetData[widget.id] = dashboardData.upcomingTasks;
          break;
        case 'interventions':
          widgetData[widget.id] = dashboardData.urgentInterventions;
          break;
        case 'stock':
          widgetData[widget.id] = dashboardData.stockAlerts;
          break;
        case 'calendar':
          // Transform maintenance events to calendar format
          const calendarEvents = dashboardData.maintenanceEvents?.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            equipment: event.equipment,
            status: event.status,
            priority: event.priority,
            assignedTo: event.assignedTo,
            duration: event.duration
          })) || [];
          widgetData[widget.id] = calendarEvents;
          break;
        default:
          widgetData[widget.id] = null;
      }
    });

    setData(widgetData);
    setLoading(widgetLoading);
  }, [widgets, dashboardData, activeView]);

  return { data, loading, refetch };
};
