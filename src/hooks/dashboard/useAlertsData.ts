
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
      // Récupérer les alertes depuis Supabase
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        const alerts: AlertItem[] = data.map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          severity: item.severity,
          date: new Date(item.created_at),
          equipmentId: item.equipment_id,
          equipmentName: item.equipment_name,
          status: item.status,
          type: item.type
        }));
        setAlertItems(alerts);
      }
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
          type: "maintenance"
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
          type: "reminder"
        },
        {
          id: 3,
          title: "Stock faible de pièces",
          message: "Le stock de filtres à carburant est en dessous du niveau minimum",
          severity: "medium",
          date: new Date(new Date().setDate(new Date().getDate() - 2)),
          equipmentId: 0,
          equipmentName: "",
          status: "new",
          type: "inventory"
        },
        {
          id: 4,
          title: "Batterie faible",
          message: "La batterie du Kubota M7-172 est faible",
          severity: "low",
          date: new Date(new Date().setDate(new Date().getDate() - 3)),
          equipmentId: 3,
          equipmentName: "Kubota M7-172",
          status: "new",
          type: "maintenance"
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
