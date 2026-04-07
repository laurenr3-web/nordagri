
import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WidgetConfig } from './useDashboardLayout';
import { useDashboardData } from './useDashboardData';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { useMaintenanceSuggestions } from '@/hooks/planning/useMaintenanceSuggestions';
import { useFarmId } from '@/hooks/useFarmId';
import { useAuthContext } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWidgetData = (widgets: WidgetConfig[], activeView: string) => {
  const queryClient = useQueryClient();
  const dashboardData = useDashboardData();
  const { user } = useAuthContext();
  const { farmId } = useFarmId();

  // Planning data for today
  const todayStr = new Date().toISOString().split('T')[0];
  const hasPlanningWidget = widgets.some(w => w.type === 'planning' && w.enabled);

  const { groupedTasks, isLoading: planningLoading } = usePlanningTasks(
    hasPlanningWidget ? farmId : null,
    todayStr,
    todayStr
  );

  const { suggestions: maintenanceSuggestions, isLoading: suggestionsLoading } = useMaintenanceSuggestions(
    hasPlanningWidget ? farmId : null,
    user?.id || null
  );

  // Team members for display
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembersDashboard', farmId],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('farm_id', farmId!);
      return data || [];
    },
    enabled: !!farmId && hasPlanningWidget,
  });

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['interventions'] });
    queryClient.invalidateQueries({ queryKey: ['parts'] });
    queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
    queryClient.invalidateQueries({ queryKey: ['maintenanceSuggestions'] });
  }, [queryClient]);

  const data = useMemo(() => {
    const widgetData: Record<string, any> = {};

    widgets.forEach(widget => {
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
          widgetData[widget.id] = dashboardData.weeklyCalendarEvents;
          break;
        case 'planning':
          widgetData[widget.id] = {
            critical: groupedTasks.critical || [],
            important: groupedTasks.important || [],
            todo: groupedTasks.todo || [],
            maintenanceDueCount: maintenanceSuggestions.length,
            teamMembers,
          };
          break;
        default:
          widgetData[widget.id] = null;
      }
    });

    return widgetData;
  }, [widgets, dashboardData, groupedTasks, maintenanceSuggestions, teamMembers]);

  const loading = useMemo(() => {
    const widgetLoading: Record<string, boolean> = {};
    widgets.forEach(widget => {
      if (widget.type === 'planning') {
        widgetLoading[widget.id] = planningLoading || suggestionsLoading;
      } else {
        widgetLoading[widget.id] = dashboardData.loading;
      }
    });
    return widgetLoading;
  }, [widgets, dashboardData.loading, planningLoading, suggestionsLoading]);

  return { data, loading, refetch };
};
