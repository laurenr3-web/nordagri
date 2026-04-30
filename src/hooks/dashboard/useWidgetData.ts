
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
import { usePointsWatchData } from './usePointsWatchData';
import { useCheckTodayData } from './useCheckTodayData';
import { useRecentActivityData } from './useRecentActivityData';
import { usePoints } from '@/hooks/points/usePoints';

export const useWidgetData = (widgets: WidgetConfig[], activeView: string) => {
  const queryClient = useQueryClient();
  const dashboardData = useDashboardData();
  const { user } = useAuthContext();
  const { farmId } = useFarmId();

  // Planning data for today
  const todayStr = new Date().toISOString().split('T')[0];
  const hasPlanningWidget = widgets.some(w => w.type === 'planning' && w.enabled);
  const hasPointsWatchWidget = widgets.some(w => w.type === 'points_watch' && w.enabled);
  const hasCheckTodayWidget = widgets.some(w => w.type === 'check_today' && w.enabled);
  const hasRecentActivityWidget = widgets.some(w => w.type === 'recent_activity' && w.enabled);

  const { groupedTasks, isLoading: planningLoading } = usePlanningTasks(
    hasPlanningWidget ? farmId : null,
    todayStr,
    todayStr
  );

  const { suggestions: maintenanceSuggestions, isLoading: suggestionsLoading } = useMaintenanceSuggestions(
    (hasPlanningWidget || hasCheckTodayWidget) ? farmId : null,
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

  // New action-oriented widgets
  const { data: pointsWatchData, isLoading: pointsWatchLoading } = usePointsWatchData(
    farmId,
    hasPointsWatchWidget
  );
  const { data: checkTodayRaw, isLoading: checkTodayLoading } = useCheckTodayData(
    farmId,
    hasCheckTodayWidget
  );
  const { data: recentActivityData, isLoading: recentActivityLoading } = useRecentActivityData(
    farmId,
    hasRecentActivityWidget
  );

  // Active points (open + watch) for the stats tile
  const { data: allPoints } = usePoints(farmId);
  const activePointsCount = (allPoints ?? []).filter(p => p.status !== 'resolved').length;

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
            pointsToWatch: activePointsCount
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
        case 'points_watch':
          widgetData[widget.id] = pointsWatchData ?? null;
          break;
        case 'check_today':
          widgetData[widget.id] = checkTodayRaw
            ? { ...checkTodayRaw, maintenanceDueCount: maintenanceSuggestions.length }
            : null;
          break;
        case 'recent_activity':
          widgetData[widget.id] = recentActivityData ?? null;
          break;
        default:
          widgetData[widget.id] = null;
      }
    });

    return widgetData;
  }, [widgets, dashboardData, groupedTasks, maintenanceSuggestions, teamMembers, pointsWatchData, checkTodayRaw, recentActivityData]);

  const loading = useMemo(() => {
    const widgetLoading: Record<string, boolean> = {};
    widgets.forEach(widget => {
      if (widget.type === 'planning') {
        widgetLoading[widget.id] = planningLoading || suggestionsLoading;
      } else if (widget.type === 'points_watch') {
        widgetLoading[widget.id] = pointsWatchLoading;
      } else if (widget.type === 'check_today') {
        widgetLoading[widget.id] = checkTodayLoading || suggestionsLoading;
      } else if (widget.type === 'recent_activity') {
        widgetLoading[widget.id] = recentActivityLoading;
      } else {
        widgetLoading[widget.id] = dashboardData.loading;
      }
    });
    return widgetLoading;
  }, [widgets, dashboardData.loading, planningLoading, suggestionsLoading, pointsWatchLoading, checkTodayLoading, recentActivityLoading]);

  return { data, loading, refetch };
};
