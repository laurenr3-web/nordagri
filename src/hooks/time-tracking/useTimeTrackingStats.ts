
import { useState, useEffect } from 'react';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntry } from './types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export function useTimeTrackingStats(userId: string | null) {
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      
      // Calcul pour aujourd'hui
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      
      // Utiliser les mêmes paramètres de début et fin de semaine que dans useMonthlySummary
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Commence le lundi
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Finit le dimanche
      
      // Calcul pour le mois
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      // Récupérer toutes les entrées de temps pour le mois en cours
      const monthEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: monthStart,
        endDate: monthEnd
      });
      
      // Filtrer pour obtenir les entrées pour aujourd'hui et cette semaine
      const todayEntries = monthEntries.filter(entry => {
        const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
        return entryDate === todayString;
      });
      
      const weekEntries = monthEntries.filter(entry => {
        const entryDate = new Date(entry.start_time);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      setStats({
        totalToday: calculateTotalHours(todayEntries),
        totalWeek: calculateTotalHours(weekEntries),
        totalMonth: calculateTotalHours(monthEntries)
      });
    } catch (error) {
      console.error("Error calculating statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalHours = (entries: TimeEntry[]): number => {
    let totalHours = 0;
    
    entries.forEach(entry => {
      // Si nous avons une durée stockée et que la session est terminée, utiliser cette valeur
      if (entry.status === 'completed' && typeof entry.duration === 'number') {
        totalHours += entry.duration;
        return;
      }
      
      // Pour les entrées actives ou sans durée, calculer à partir de start_time
      const start = new Date(entry.start_time);
      let end;
      
      if (entry.end_time) {
        end = new Date(entry.end_time);
      } else if (entry.status === 'active') {
        // Pour les sessions en cours, calculer jusqu'à maintenant
        end = new Date();
      } else {
        // Pour les sessions en pause, ne pas calculer de temps supplémentaire
        return;
      }
      
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      
      // Ajouter une vérification pour éviter les valeurs aberrantes
      if (hours >= 0 && hours < 24) {
        totalHours += hours;
      } else if (hours >= 24) {
        console.warn(`Unusually long time entry detected: ${hours.toFixed(1)} hours`);
      }
    });
    
    // Limite de temps maximum par période pour éviter les valeurs aberrantes
    const MAX_DAILY_HOURS = 24;
    const MAX_WEEKLY_HOURS = 168; // 7 jours * 24 heures
    const MAX_MONTHLY_HOURS = 744; // ~31 jours * 24 heures
    
    if (entries.length > 0) {
      // Déterminer le type de période en fonction du premier élément
      const firstEntry = entries[0];
      const firstDate = new Date(firstEntry.start_time);
      
      // Vérifier si toutes les entrées sont du même jour
      const allSameDay = entries.every(entry => {
        return format(new Date(entry.start_time), 'yyyy-MM-dd') === format(firstDate, 'yyyy-MM-dd');
      });
      
      if (allSameDay) {
        return Math.min(totalHours, MAX_DAILY_HOURS);
      }
      
      // Vérifier si toutes les entrées sont dans la même semaine
      const weekStart = startOfWeek(firstDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(firstDate, { weekStartsOn: 1 });
      const allSameWeek = entries.every(entry => {
        const date = new Date(entry.start_time);
        return date >= weekStart && date <= weekEnd;
      });
      
      if (allSameWeek) {
        return Math.min(totalHours, MAX_WEEKLY_HOURS);
      }
      
      // Par défaut, limiter au maximum mensuel
      return Math.min(totalHours, MAX_MONTHLY_HOURS);
    }
    
    return totalHours;
  };

  useEffect(() => {
    if (userId) {
      calculateStats();
      
      // Actualiser les statistiques toutes les minutes pour les sessions actives
      const intervalId = setInterval(calculateStats, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [userId]);

  return { stats, isLoading, calculateStats };
}
