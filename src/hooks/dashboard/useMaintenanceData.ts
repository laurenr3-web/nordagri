
import { useEffect, useState } from 'react';
import { MaintenanceEvent } from '../dashboard/types/dashboardTypes';

export function useMaintenanceData() {
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [weeklyCalendarEvents, setWeeklyCalendarEvents] = useState<MaintenanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fake data loading
    const loadData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Here we'd normally fetch from an API
        const fakeMaintenanceData: MaintenanceEvent[] = [
          {
            id: 1,
            title: "Remplacement des filtres",
            description: "Changement des filtres à air et huile",
            equipment: "Tracteur John Deere",
            equipment_id: 1,
            status: "scheduled",
            priority: "high",
            assigned_to: "Jean Dupont",
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 2,
            title: "Vidange moteur",
            description: "Vidange complète et remplacement filtre à huile",
            equipment: "Moissonneuse CLAAS",
            equipment_id: 2,
            status: "scheduled",
            priority: "medium",
            assigned_to: "Sophie Martin",
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 3,
            title: "Nettoyage du radiateur",
            description: "Nettoyage complet du système de refroidissement",
            equipment: "Tracteur Case IH",
            equipment_id: 3,
            status: "scheduled",
            priority: "low",
            assigned_to: "Thomas Bernard",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: 4,
            title: "Calibrage du système de direction",
            description: "Recalibrage du système de guidage GPS",
            equipment: "Tracteur New Holland",
            equipment_id: 4,
            status: "scheduled",
            priority: "medium",
            assigned_to: "Marie Dubois",
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          },
        ];
        
        // Generate more events for the calendar view
        const calendarEvents: MaintenanceEvent[] = [
          ...fakeMaintenanceData,
          {
            id: 5,
            title: "Vérification des pneus",
            equipment: "Tracteur Fendt",
            equipment_id: 5,
            status: "scheduled",
            priority: "low",
            assigned_to: "Pierre Leroy",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 6,
            title: "Remplacement courroie",
            equipment: "Presse à balles",
            equipment_id: 6,
            status: "completed",
            priority: "high",
            assigned_to: "Julie Lambert",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 7,
            title: "Graissage",
            equipment: "Épandeur d'engrais",
            equipment_id: 7,
            status: "scheduled",
            priority: "medium",
            assigned_to: "Marc Fournier",
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
        ];
        
        setMaintenanceEvents(fakeMaintenanceData);
        setWeeklyCalendarEvents(calendarEvents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  return { maintenanceEvents, weeklyCalendarEvents, isLoading, error };
}
