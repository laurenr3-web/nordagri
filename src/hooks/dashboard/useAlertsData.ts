
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface AlertItem {
  id: string | number;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  equipmentId: number;
  equipmentName: string;
  status: 'new' | 'acknowledged' | 'resolved';
  type: string;
  time: string;
  equipment: string;
}

export const useAlertsData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);

  useEffect(() => {
    fetchAlertsData();
  }, [user]);

  const fetchAlertsData = async () => {
    setLoading(true);
    try {
      // Récupérer les alertes de maintenance
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(10);
      
      if (maintenanceError) throw maintenanceError;
      
      // Récupérer les pièces en stock faible
      const { data: partsData, error: partsError } = await supabase
        .from('parts_inventory')
        .select('*')
        .lt('quantity', supabase.raw('reorder_threshold'))
        .order('quantity', { ascending: true })
        .limit(5);
        
      if (partsError) throw partsError;
      
      // Combiner les alertes
      const alerts: AlertItem[] = [];
      
      // Transformer les tâches de maintenance en alertes
      if (maintenanceData) {
        maintenanceData.forEach(task => {
          const dueDate = new Date(task.due_date);
          const now = new Date();
          const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          
          // Déterminer la sévérité basée sur la date d'échéance et la priorité
          let severity: 'high' | 'medium' | 'low' = 'medium';
          if (daysDiff <= 2 || task.priority === 'high' || task.priority === 'critical') {
            severity = 'high';
          } else if (daysDiff <= 7) {
            severity = 'medium';
          } else {
            severity = 'low';
          }
          
          alerts.push({
            id: task.id,
            title: 'Maintenance planifiée',
            message: `${task.title} pour ${task.equipment}`,
            severity,
            date: dueDate,
            equipmentId: task.equipment_id || 0,
            equipmentName: task.equipment,
            status: 'new',
            type: 'maintenance',
            time: dueDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            equipment: task.equipment
          });
        });
      }
      
      // Transformer les pièces en stock faible en alertes
      if (partsData) {
        partsData.forEach(part => {
          // Plus le stock est bas par rapport au seuil, plus la sévérité est élevée
          const ratio = part.quantity / (part.reorder_threshold || 1);
          let severity: 'high' | 'medium' | 'low' = 'medium';
          
          if (ratio <= 0.3) {
            severity = 'high';
          } else if (ratio <= 0.7) {
            severity = 'medium';
          } else {
            severity = 'low';
          }
          
          alerts.push({
            id: `part-${part.id}`,
            title: 'Stock faible',
            message: `${part.name} en stock faible (${part.quantity}/${part.reorder_threshold})`,
            severity,
            date: new Date(),
            equipmentId: 0,
            equipmentName: '',
            status: 'new',
            type: 'inventory',
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            equipment: 'N/A'
          });
        });
      }
      
      // Trier les alertes par sévérité et date
      alerts.sort((a, b) => {
        if (a.severity === 'high' && b.severity !== 'high') return -1;
        if (a.severity !== 'high' && b.severity === 'high') return 1;
        if (a.severity === 'medium' && b.severity === 'low') return -1;
        if (a.severity === 'low' && b.severity === 'medium') return 1;
        return b.date.getTime() - a.date.getTime();
      });
      
      setAlertItems(alerts);
    } catch (error) {
      console.error('Error fetching alerts data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les alertes.",
        variant: "destructive",
      });
      
      // Données par défaut en cas d'échec
      setAlertItems([
        {
          id: 1,
          title: "Niveau d'huile bas",
          message: "Le tracteur John Deere 8R 410 a un niveau d'huile critique",
          severity: "high",
          date: new Date(),
          equipmentId: 1,
          equipmentName: "John Deere 8R 410",
          status: "new",
          type: "maintenance",
          time: "09:15",
          equipment: "John Deere 8R 410"
        },
        {
          id: 2,
          title: "Maintenance planifiée",
          message: "Maintenance programmée pour Case IH Axial-Flow demain",
          severity: "medium",
          date: new Date(new Date().setDate(new Date().getDate() - 1)),
          equipmentId: 2,
          equipmentName: "Case IH Axial-Flow",
          status: "acknowledged",
          type: "reminder",
          time: "14:30",
          equipment: "Case IH Axial-Flow"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    alertItems
  };
};

export default useAlertsData;
