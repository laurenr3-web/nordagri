
import React, { useState, useCallback } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import des widgets
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { EquipmentWidget } from '@/components/dashboard/widgets/EquipmentWidget';
import { AlertsWidget } from '@/components/dashboard/widgets/AlertsWidget';
import { CalendarWidget } from '@/components/dashboard/widgets/CalendarWidget';

// Import du système de widgets
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';

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

const Dashboard = () => {
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

  // Filtrer les widgets actifs de manière simple
  const activeWidgets = widgets ? widgets.filter(w => w && w.enabled) : [];
  
  const { data, loading, refetch } = useWidgetData(activeWidgets, activeView);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [refetch]);

  const renderWidget = useCallback((widget: WidgetConfig) => {
    if (!widget || !data) return null;
    
    const widgetData = data[widget.id];
    
    const widgetComponents: Record<string, React.ComponentType<any>> = {
      stats: StatsWidget,
      equipment: EquipmentWidget,
      alerts: AlertsWidget,
      calendar: CalendarWidget,
    };

    const WidgetComponent = widgetComponents[widget.type];
    if (!WidgetComponent) return null;

    return (
      <DashboardWidget
        key={widget.id}
        id={widget.id}
        title={widget.title}
        size={widget.size}
        onRemove={() => removeWidget(widget.id)}
        onResize={(size) => updateWidget(widget.id, { size })}
        isCustomizing={isCustomizing}
      >
        <WidgetComponent 
          data={widgetData} 
          loading={loading[widget.id]}
          size={widget.size}
        />
      </DashboardWidget>
    );
  }, [data, loading, isCustomizing, removeWidget, updateWidget]);

  return (
    <MainLayout>
      <LayoutWrapper>
        {/* Header avec actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <PageHeader 
            title="Tableau de bord" 
            description="Vue d'ensemble de vos opérations"
            className="mb-0"
          />
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Button
              variant={isCustomizing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isCustomizing ? 'Terminer' : 'Personnaliser'}
            </Button>
          </div>
        </div>

        {/* Onglets de navigation */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-grid mb-6">
            <TabsTrigger value="main" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Vue principale</span>
              <span className="sm:hidden">Principal</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendrier</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Alertes</span>
            </TabsTrigger>
          </TabsList>

          {/* Mode personnalisation */}
          <AnimatePresence>
            {isCustomizing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <DashboardCustomizer
                  widgets={widgets}
                  onToggleWidget={(id) => 
                    updateWidget(id, { enabled: !widgets.find(w => w.id === id)?.enabled })
                  }
                  onResetLayout={resetLayout}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contenu des vues */}
          <TabsContent value="main" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {activeWidgets.map(widget => {
                if (!widget) return null;
                
                const colSpan = {
                  small: 'lg:col-span-3',
                  medium: 'lg:col-span-6', 
                  large: 'lg:col-span-8',
                  full: 'lg:col-span-12'
                }[widget.size] || 'lg:col-span-6';

                return (
                  <div key={widget.id} className={colSpan}>
                    {renderWidget(widget)}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarWidget 
              data={data?.calendar} 
              loading={loading?.calendar}
              size="full"
              view="month"
            />
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <AlertsWidget 
              data={data?.alerts} 
              loading={loading?.alerts}
              size="full"
              view="detailed"
            />
          </TabsContent>
        </Tabs>
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Dashboard;
