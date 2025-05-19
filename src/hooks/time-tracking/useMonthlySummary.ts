
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface TimeSummary {
  today: number;
  week: number;
  month: number;
  todayPercentage: number;
  weekPercentage: number;
  monthPercentage: number;
}

export function useMonthlySummary() {
  const [summary, setSummary] = useState<TimeSummary>({
    today: 0,
    week: 0,
    month: 0,
    todayPercentage: 0,
    weekPercentage: 0,
    monthPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        
        // Dates de calcul
        const today = new Date();
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        
        // Utiliser la même logique que dans useTimeTrackingStats pour la semaine
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Commence le lundi
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Finit le dimanche
        
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Obtenir toutes les entrées de temps pour le mois en cours
        const { data, error } = await supabase
          .from('time_sessions')
          .select(`
            id,
            start_time,
            end_time,
            duration,
            status
          `)
          .eq('user_id', userId)
          .gte('start_time', monthStart.toISOString())
          .lte('start_time', monthEnd.toISOString());
          
        if (error) throw error;
        
        let todayHours = 0;
        let weekHours = 0;
        let monthHours = 0;
        
        // Heures de travail standards pour le calcul des pourcentages
        const standardDayHours = 8; // 8 heures par jour
        const standardWeekHours = 40; // 40 heures par semaine
        const standardMonthHours = 160; // ~160 heures par mois
        
        // Calculer les heures pour chaque période
        data?.forEach(session => {
          const startTime = new Date(session.start_time);
          const todayDate = format(today, 'yyyy-MM-dd');
          const sessionDate = format(startTime, 'yyyy-MM-dd');
          
          // Calculer la durée avec la même logique que useTimeTrackingStats
          let sessionDuration = 0;
          
          // Pour les sessions terminées avec durée stockée
          if (session.status === 'completed' && session.duration) {
            sessionDuration = session.duration;
          } 
          // Pour les sessions sans durée ou actives
          else {
            const endTime = session.end_time 
              ? new Date(session.end_time) 
              : (session.status === 'active' ? new Date() : startTime);
              
            // Ne calculer la durée que si la session est terminée ou active
            if (session.status === 'completed' || session.status === 'active') {
              sessionDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // heures
            }
          }
          
          // Limiter les durées aberrantes
          if (sessionDuration > 24) {
            console.warn(`Unusually long session detected: ${sessionDuration.toFixed(1)} hours`);
            sessionDuration = Math.min(sessionDuration, 24); // Limite à 24 heures par session
          }
          
          // Vérifier si dans le mois en cours (déjà filtré par la requête, mais par précaution)
          if (startTime >= monthStart && startTime <= monthEnd) {
            monthHours += sessionDuration;
            
            // Vérifier si dans la semaine en cours
            if (startTime >= weekStart && startTime <= weekEnd) {
              weekHours += sessionDuration;
              
              // Vérifier si aujourd'hui
              if (sessionDate === todayDate) {
                todayHours += sessionDuration;
              }
            }
          }
        });
        
        // Appliquer des limites raisonnables
        monthHours = Math.min(monthHours, 744); // ~31 jours * 24h
        weekHours = Math.min(weekHours, 168); // 7 jours * 24h
        todayHours = Math.min(todayHours, 24);
        
        // Calculer les pourcentages
        const todayPercentage = Math.min((todayHours / standardDayHours) * 100, 100);
        const weekPercentage = Math.min((weekHours / standardWeekHours) * 100, 100);
        const monthPercentage = Math.min((monthHours / standardMonthHours) * 100, 100);
        
        setSummary({
          today: todayHours,
          week: weekHours,
          month: monthHours,
          todayPercentage,
          weekPercentage,
          monthPercentage
        });
      } catch (err) {
        console.error('Error fetching time summary:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummary();
    
    // Mettre en place un intervalle pour actualiser les données toutes les minutes (important pour les sessions actives)
    const intervalId = setInterval(fetchSummary, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return {
    summary,
    isLoading,
    error
  };
}
