
import React, { useState, useCallback } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Tabs } from '@/components/ui/tabs';

// Import the new focused components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardCustomization } from '@/components/dashboard/DashboardCustomization';
import { DashboardMainView } from '@/components/dashboard/DashboardMainView';
import { DashboardCalendarView } from '@/components/dashboard/DashboardCalendarView';
import { DashboardAlertsView } from '@/components/dashboard/DashboardAlertsView';

// Hooks
import { useDashboardLayout, WidgetConfig } from '@/hooks/dashboard/useDashboardLayout';
import { useWidgetData } from '@/hooks/dashboard/useWidgetData';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stats', type: 'stats', title: 'Statistiques', size: 'full', enabled: true },
  { id: 'equipment', type: 'equipment', title: 'Équipements', size: 'medium', enabled: true },
  { id: 'alerts', type: 'alerts', title: 'Alertes', size: 'medium', enabled: true },
  { id: 'calendar', type: 'calendar', title: 'Calendrier', size: 'large', enabled: true },
];

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'main' | 'calendar' | 'alerts'>('main');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Gestion du layout personnalisé
  const { 
    widgets, 
    updateWidget, 
    removeWidget, 
    reorderWidgets,
    resetLayout 
  } = useDashboardLayout(DEFAULT_WIDGETS);

  // Auto-refresh toutes les 5 minutes
  const { refresh } = useAutoRefresh(5 * 60 * 1000);

  // Filtrer les widgets actifs avec sécurité renforcée
  const activeWidgets = React.useMemo(() => {
    if (!widgets || !Array.isArray(widgets)) {
      console.warn('Widgets non disponibles, utilisation des valeurs par défaut');
      return DEFAULT_WIDGETS.filter(w => w.enabled);
    }
    return widgets.filter(w => w && w.enabled) || [];
  }, [widgets]);
  
  const { data, loading, refetch } = useWidgetData(activeWidgets, activeView);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refetch]);

  const handleToggleCustomizing = useCallback(() => {
    setIsCustomizing(!isCustomizing);
  }, [isCustomizing]);

  const handleToggleWidget = useCallback((id: string) => {
    const widgetsToSearch = widgets || DEFAULT_WIDGETS;
    const widget = widgetsToSearch.find(w => w && w.id === id);
    if (widget && updateWidget) {
      updateWidget(id, { enabled: !widget.enabled });
    }
  }, [widgets, updateWidget]);

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view as 'main' | 'calendar' | 'alerts');
  }, []);

  // Fournir des valeurs par défaut sécurisées
  const safeData = data || {};
  const safeLoading = loading || {};
  const safeWidgets = widgets || DEFAULT_WIDGETS;

  return (
    <MainLayout>
      <LayoutWrapper>
        <DashboardHeader
          isRefreshing={isRefreshing}
          isCustomizing={isCustomizing}
          onRefresh={handleRefresh}
          onToggleCustomizing={handleToggleCustomizing}
        />

        <Tabs value={activeView} onValueChange={handleViewChange}>
          <DashboardTabs
            activeView={activeView}
            onViewChange={handleViewChange}
          />

          <DashboardCustomization
            isCustomizing={isCustomizing}
            widgets={safeWidgets}
            onToggleWidget={handleToggleWidget}
            onResetLayout={resetLayout || (() => {})}
          />

          <DashboardMainView
            activeWidgets={activeWidgets}
            data={safeData}
            loading={safeLoading}
            isCustomizing={isCustomizing}
            onRemoveWidget={removeWidget || (() => {})}
            onUpdateWidget={updateWidget || (() => {})}
          />

          <DashboardCalendarView
            data={safeData}
            loading={safeLoading}
          />

          <DashboardAlertsView
            data={safeData}
            loading={safeLoading}
          />
        </Tabs>
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Dashboard;
