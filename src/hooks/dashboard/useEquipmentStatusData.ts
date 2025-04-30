
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';
import { format, isBefore, isAfter, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EquipmentItem } from './types/equipmentTypes';

export function useEquipmentStatusData() {
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    async function fetchEquipmentWithMaintenance() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching equipment data for user:', user.id);
        
        // Fetch equipment data
        const { data: equipment, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name, type, status, image, valeur_actuelle, unite_d_usure')
          .eq('owner_id', user.id)
          .order('name');
        
        if (equipmentError) {
          throw equipmentError;
        }

        console.log('Equipment data fetched:', equipment?.length || 0, equipment);
        
        if (!equipment || equipment.length === 0) {
          setEquipmentData([]);
          setLoading(false);
          return;
        }
        
        // Get equipment IDs for the query
        const equipmentIds = equipment.map(eq => eq.id);
        
        // Fetch upcoming maintenance tasks for each equipment
        const { data: maintenanceTasks, error: maintenanceError } = await supabase
          .from('maintenance_tasks')
          .select('id, title, equipment_id, type, due_date, priority, status')
          .in('equipment_id', equipmentIds)
          .in('status', ['scheduled', 'pending-parts'])
          .order('due_date', { ascending: true });
        
        if (maintenanceError) {
          console.error('Error fetching maintenance tasks:', maintenanceError);
        }

        console.log('Maintenance tasks fetched:', maintenanceTasks?.length || 0, maintenanceTasks);
        
        // Fetch maintenance plans for service intervals
        const { data: maintenancePlans, error: plansError } = await supabase
          .from('maintenance_plans')
          .select('id, equipment_id, interval, frequency, trigger_hours')
          .in('equipment_id', equipmentIds)
          .eq('active', true);
          
        if (plansError) {
          console.error('Error fetching maintenance plans:', plansError);
        }

        console.log('Maintenance plans fetched:', maintenancePlans?.length || 0, maintenancePlans);
        
        // Transform equipment data with maintenance information
        const enhancedEquipment = equipment.map(item => {
          // Get upcoming maintenance for this equipment
          const upcomingMaintenance = maintenanceTasks
            ?.filter(task => task.equipment_id === item.id)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];
          
          // Get service interval from maintenance plans
          const servicePlan = maintenancePlans
            ?.filter(plan => plan.equipment_id === item.id)
            .sort((a, b) => (a.trigger_hours || 0) - (b.trigger_hours || 0))[0];
          
          // Determine maintenance status
          let maintenanceStatus = 'À jour';
          const currentDate = new Date();
          
          if (upcomingMaintenance?.due_date) {
            const dueDate = new Date(upcomingMaintenance.due_date);
            const daysDiff = differenceInDays(dueDate, currentDate);
            
            if (isBefore(dueDate, currentDate)) {
              maintenanceStatus = 'En retard';
            } else if (daysDiff <= 30) {
              if (daysDiff === 1) {
                maintenanceStatus = 'Maintenance demain';
              } else if (daysDiff < 7) {
                maintenanceStatus = `Maintenance dans ${daysDiff} jours`;
              } else {
                const weeks = Math.floor(daysDiff / 7);
                maintenanceStatus = `Maintenance dans ${weeks} semaine${weeks > 1 ? 's' : ''}`;
              }
            }
          }

          // Calculate service hours and threshold
          const currentHours = item.valeur_actuelle || 0;
          const serviceThreshold = servicePlan?.trigger_hours || 500; // Default if not defined
          
          return {
            id: item.id,
            name: item.name,
            type: item.type || 'Équipement',
            status: item.status as 'operational' | 'maintenance' | 'repair' | 'inactive',
            image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
            usage: {
              hours: Math.round(currentHours),
              target: serviceThreshold
            },
            nextService: {
              type: upcomingMaintenance?.title || 'Maintenance régulière',
              due: maintenanceStatus
            }
          };
        });
        
        console.log('Enhanced equipment data prepared:', enhancedEquipment);
        setEquipmentData(enhancedEquipment);
      } catch (err) {
        console.error('Error fetching equipment status data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch equipment data'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchEquipmentWithMaintenance();
  }, [user?.id]);
  
  return {
    equipmentData,
    loading,
    error
  };
}
