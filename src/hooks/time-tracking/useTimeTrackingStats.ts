
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
    return entries.reduce((total, entry) => {
      // Check if duration exists in the entry as any property
      const durationValue = (entry as any).duration;
      if (durationValue !== undefined && durationValue !== null) {
        return total + durationValue;
      }
      
      // If no duration, calculate from start_time and end_time
      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : new Date();
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return total + hours;
    }, 0);
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
