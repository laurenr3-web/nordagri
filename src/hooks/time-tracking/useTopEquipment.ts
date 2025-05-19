
import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface TopEquipment {
  id: number;
  name: string;
  hours: number;
}

export function useTopEquipment(month: Date) {
  const [equipment, setEquipment] = useState<TopEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTopEquipment = async () => {
      try {
        setIsLoading(true);
        
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Get hours per equipment
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            duration,
            start_time,
            end_time,
            equipment_id,
            equipment:equipment_id (id, name)
          `)
          .eq('user_id', userId)
          .not('equipment_id', 'is', null)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString());
          
        if (error) throw error;
        
        // Aggregate hours by equipment
        const hoursByEquipment = new Map<number, { name: string, hours: number }>();
        
        data?.forEach(session => {
          // Skip if no equipment
          if (!session.equipment_id || !session.equipment) return;
          
          const equipmentId = session.equipment_id;
          // Fixed: Access equipment name properly
          const equipmentName = typeof session.equipment === 'object' ? 
            (session.equipment as any).name || 'Équipement inconnu' : 'Équipement inconnu';
          
          // Calculate duration if not available
          let sessionDuration = session.duration;
          if (!sessionDuration && session.end_time) {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            sessionDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
          }
          
          if (sessionDuration) {
            const current = hoursByEquipment.get(equipmentId) || { name: equipmentName, hours: 0 };
            current.hours += sessionDuration;
            hoursByEquipment.set(equipmentId, current);
          }
        });
        
        // Convert map to array
        const result: TopEquipment[] = Array.from(hoursByEquipment.entries())
          .map(([id, { name, hours }]) => ({
            id,
            name,
            hours
          }))
          .sort((a, b) => b.hours - a.hours) // Sort by hours descending
          .slice(0, 5); // Get top 5
        
        setEquipment(result);
      } catch (err) {
        console.error('Error fetching top equipment:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopEquipment();
  }, [month]);
  
  return {
    equipment,
    isLoading,
    error
  };
}
