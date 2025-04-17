
import { useState, useEffect } from 'react';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntry } from './types';
import { startOfWeek, endOfWeek } from 'date-fns';

export function useTimeTrackingStats(userId: string | null) {
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0
  });

  const calculateStats = async () => {
    if (!userId) return;

    try {
      // Calcul pour aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: today,
        endDate: tomorrow
      });
      
      // Calcul pour la semaine
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Commence le lundi
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Finit le dimanche
      
      const weekEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: weekStart,
        endDate: weekEnd
      });
      
      // Calcul pour le mois
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      const monthEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      });

      setStats({
        totalToday: calculateTotalHours(todayEntries),
        totalWeek: calculateTotalHours(weekEntries),
        totalMonth: calculateTotalHours(monthEntries)
      });
    } catch (error) {
      console.error("Error calculating statistics:", error);
    }
  };

  const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
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
    }
  }, [userId]);

  return { stats };
}
