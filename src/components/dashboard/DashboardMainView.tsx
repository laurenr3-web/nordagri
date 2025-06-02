
import React, { useCallback } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { EquipmentWidget } from '@/components/dashboard/widgets/EquipmentWidget';
import { AlertsWidget } from '@/components/dashboard/widgets/AlertsWidget';
import { CalendarWidget } from '@/components/dashboard/widgets/CalendarWidget';
import { WidgetConfig } from '@/hooks/dashboard/useDashboardLayout';

interface DashboardMainViewProps {
  activeWidgets: WidgetConfig[];
  data: Record<string, any>;
  loading: Record<string, boolean>;
  isCustomizing: boolean;
  onRemoveWidget: (id: string) => void;
  onUpdateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
}

export const DashboardMainView: React.FC<DashboardMainViewProps> = ({
  activeWidgets,
  data,
  loading,
  isCustomizing,
  onRemoveWidget,
  onUpdateWidget
}) => {
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
        onRemove={() => onRemoveWidget(widget.id)}
        onResize={(size) => onUpdateWidget(widget.id, { size })}
        isCustomizing={isCustomizing}
      >
        <WidgetComponent 
          data={widgetData} 
          loading={loading[widget.id]}
          size={widget.size}
        />
      </DashboardWidget>
    );
  }, [data, loading, isCustomizing, onRemoveWidget, onUpdateWidget]);

  // Early return if no active widgets to prevent rendering issues
  if (!activeWidgets || activeWidgets.length === 0) {
    return (
      <TabsContent value="main" className="mt-0">
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Aucun widget actif</p>
        </div>
      </TabsContent>
    );
  }

  return (
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
  );
};
