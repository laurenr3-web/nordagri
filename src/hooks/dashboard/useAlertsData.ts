import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface AlertItem {
  id: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  date: Date;
  action?: string;
}

export const useAlertsData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const setMockData = () => {
    setAlertItems([
      {
        id: 1,
        type: 'error',
        message: 'Harvester engine overheating detected',
        date: new Date(),
        action: 'Check Engine'
      },
      {
        id: 2,
        type: 'warning',
        message: 'Low oil pressure warning on Tractor #3',
        date: new Date(),
        action: 'Schedule Service'
      }
    ]);
    setLoading(false);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const alerts: AlertItem[] = [];
      let alertId = 1;
      
      // Get low parts inventory
      const { data: lowPartsData, error: lowPartsError } = await supabase
        .from('parts_inventory')
        .select('id, name, quantity, reorder_threshold')
        .filter('quantity', 'lt', 'reorder_threshold');

      if (lowPartsError) {
        console.error('Error retrieving alerts:', lowPartsError);
        // Try an alternative approach
        const { data: lowPartsDataAlt, error: lowPartsErrorAlt } = await supabase
          .from('parts_inventory')
          .select('id, name, quantity, reorder_threshold');
        
        if (!lowPartsErrorAlt && lowPartsDataAlt) {
          // Filter manually in JS
          const filteredData = lowPartsDataAlt.filter(part => 
            part.quantity < (part.reorder_threshold || 0)
          );
          
          filteredData.forEach(part => {
            alerts.push({
              id: alertId++,
              type: 'warning',
              message: `Low stock: ${part.name} (Current: ${part.quantity}, Reorder at: ${part.reorder_threshold || 0})`,
              date: new Date(),
              action: 'Reorder Parts'
            });
          });
        }
      } else if (lowPartsData && lowPartsData.length > 0) {
        lowPartsData.forEach(part => {
          alerts.push({
            id: alertId++,
            type: 'warning',
            message: `Low stock: ${part.name} (Current: ${part.quantity}, Reorder at: ${part.reorder_threshold || 0})`,
            date: new Date(),
            action: 'Reorder Parts'
          });
        });
      }

      // Get overdue maintenance
      const { data: overdueMaintenanceData, error: overdueMaintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, equipment')
        .eq('status', 'scheduled')
        .lt('due_date', new Date().toISOString());

      if (overdueMaintenanceError) {
        throw overdueMaintenanceError;
      }

      if (overdueMaintenanceData && overdueMaintenanceData.length > 0) {
        overdueMaintenanceData.forEach(maintenance => {
          alerts.push({
            id: alertId++,
            type: 'error',
            message: `Overdue maintenance: ${maintenance.title} due on ${new Date(maintenance.due_date).toLocaleDateString()}`,
            date: new Date(),
            action: 'Schedule Maintenance'
          });
        });
      }

      setAlertItems(alerts);
    } catch (error) {
      console.error('Error retrieving alerts:', error);
      // If there's an error, set an empty array to avoid UI issues
      setAlertItems([]);
      toast({
        title: "Error",
        description: "Failed to fetch alerts data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    alertItems,
    fetchAlerts
  };
};
