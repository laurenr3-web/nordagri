
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
  time: string; // Added missing property
  equipment: string; // Added missing property
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
      // Comme la table 'alerts' n'existe pas encore, on utilise des données mockées
      // Dans une implémentation réelle, on ferait:
      // const { data, error } = await supabase.from('alerts').select('*')
      
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
          type: "inventory",
          time: "10:45",
          equipment: "N/A"
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
          type: "maintenance",
          time: "16:20",
          equipment: "Kubota M7-172"
        }
      ]);
    } catch (error) {
      console.error('Error fetching alerts data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les alertes.",
        variant: "destructive",
      });
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
