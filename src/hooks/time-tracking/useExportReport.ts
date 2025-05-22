
import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExportTimeTracking } from './useExportTimeTracking';
import { TimeEntry } from './types';
import { TaskTypeDistribution } from './useTaskTypeDistribution';
import { TopEquipment } from './useTopEquipment';
import { exportTimeReportToPDF, exportTimeEntriesToPDF } from '@/utils/pdf-export/time-tracking-export';

interface ExportData {
  summary: {
    totalHours: number;
    taskTypeDistribution: TaskTypeDistribution[];
    topEquipment: TopEquipment[];
  };
  dailyHours: { date: string, hours: number }[];
  tasks: TimeEntry[];
}

export function useExportReport(month: Date) {
  const [isExporting, setIsExporting] = useState(false);
  const { exportEntriesToExcel, formatEntriesForExport } = useExportTimeTracking();

  const fetchExportData = async (): Promise<ExportData | null> => {
    console.log("Début de récupération des données pour l'export, mois:", format(month, 'MMMM yyyy', { locale: fr }));
    try {
      const startDate = startOfMonth(month);
      const endDate = endOfMonth(month);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        console.error("Aucune session utilisateur trouvée");
        return null;
      }
      
      const userId = sessionData.session.user.id;
      console.log("ID utilisateur récupéré:", userId);
      
      // Get user info
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
      
      console.log("Données utilisateur récupérées:", userData);
      
      // Get all time entries for the month
      console.log("Récupération des entrées de temps du", startDate.toISOString(), "au", endDate.toISOString());
      const { data: timeEntries } = await supabase
        .from('time_sessions')
        .select(`
          id,
          start_time,
          end_time,
          duration,
          custom_task_type,
          equipment_id,
          equipment:equipment_id (id, name),
          notes,
          user_id,
          status
        `)
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');
        
      if (!timeEntries) {
        console.error("Aucune entrée de temps trouvée");
        return null;
      }
      
      console.log(`${timeEntries.length} entrées de temps récupérées`);
      
      // Calculate summary data
      let totalHours = 0;
      const taskTypeMap = new Map<string, number>();
      const equipmentMap = new Map<number, { name: string, hours: number }>();
      const dailyHoursMap = new Map<string, number>();
      
      // Transform into TimeEntry objects
      const tasks = timeEntries.map(entry => {
        let duration = entry.duration || 0;
        if (!duration && entry.end_time) {
          const startTime = new Date(entry.start_time);
          const endTime = new Date(entry.end_time);
          duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
        }
        
        totalHours += duration;
        
        // Task type distribution
        const taskType = entry.custom_task_type || 'Non spécifié';
        taskTypeMap.set(taskType, (taskTypeMap.get(taskType) || 0) + duration);
        
        // Equipment usage - store ID along with name and hours
        if (entry.equipment_id && entry.equipment) {
          // Fixed: Access equipment name properly
          const equipmentName = typeof entry.equipment === 'object' ? (entry.equipment as any).name || 'Équipement inconnu' : 'Équipement inconnu';
          const equipmentId = entry.equipment_id;
          const currentEntry = equipmentMap.get(equipmentId) || { name: equipmentName, hours: 0 };
          currentEntry.hours += duration;
          equipmentMap.set(equipmentId, currentEntry);
        }
        
        // Daily hours
        const dateString = format(new Date(entry.start_time), 'yyyy-MM-dd');
        dailyHoursMap.set(dateString, (dailyHoursMap.get(dateString) || 0) + duration);
        
        // Return TimeEntry object
        return {
          id: entry.id,
          user_id: entry.user_id,
          owner_name: userData?.first_name + " " + userData?.last_name || "Utilisateur",
          user_name: userData?.first_name + " " + userData?.last_name || "Utilisateur",
          equipment_id: entry.equipment_id,
          custom_task_type: entry.custom_task_type,
          start_time: entry.start_time,
          end_time: entry.end_time,
          status: entry.status,
          // Fixed: Access equipment name properly
          equipment_name: typeof entry.equipment === 'object' ? (entry.equipment as any).name || "Équipement non spécifié" : "Équipement non spécifié",
          notes: entry.notes,
          task_type: entry.custom_task_type || "Non spécifié"
        } as TimeEntry;
      });
      
      // Prepare data for export
      const exportData: ExportData = {
        summary: {
          totalHours,
          taskTypeDistribution: Array.from(taskTypeMap.entries()).map(([type, hours]) => ({ type, hours })),
          topEquipment: Array.from(equipmentMap.entries())
            .map(([id, { name, hours }]) => ({ id, name, hours }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5)
        },
        dailyHours: Array.from(dailyHoursMap.entries()).map(([date, hours]) => ({ date, hours })),
        tasks
      };
      
      console.log("Données d'export préparées:", {
        totalHours,
        taskTypesCount: exportData.summary.taskTypeDistribution.length,
        topEquipmentCount: exportData.summary.topEquipment.length,
        dailyEntriesCount: exportData.dailyHours.length,
        tasksCount: exportData.tasks.length
      });
      
      return exportData;
    } catch (error) {
      console.error("Erreur lors de la préparation des données d'export:", error);
      return null;
    }
  };

  const exportToPdf = async () => {
    try {
      setIsExporting(true);
      toast.info("Génération du PDF...");
      console.log("Début de l'export PDF");
      
      const data = await fetchExportData();
      if (!data) {
        console.error("Aucune donnée à exporter");
        toast.error("Aucune donnée à exporter");
        return;
      }
      
      console.log("Données récupérées pour l'export PDF");
      
      // Get daily/weekly/monthly summary
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      const dailyHours = data.dailyHours.find(d => d.date === todayString)?.hours || 0;
      
      // Weekly hours calculation - simplified for this implementation
      const weeklyHours = data.dailyHours.reduce((sum, day) => {
        // Simple calculation just to have a non-zero value
        const dayDate = new Date(day.date);
        const diffDays = Math.abs(Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)));
        return diffDays <= 7 ? sum + day.hours : sum;
      }, 0);
      
      // Monthly total
      const monthlyHours = data.summary.totalHours;
      
      // Format the month for display
      const formattedMonth = format(month, 'MMMM yyyy', { locale: fr });
      
      // Calculate total hours for percentage calculation
      const totalTaskHours = data.summary.taskTypeDistribution.reduce((sum, task) => sum + task.hours, 0);
      console.log("Total des heures pour pourcentage:", totalTaskHours);
      
      // Add percentage to each task type distribution entry
      const taskDistributionWithPercentage = data.summary.taskTypeDistribution.map(task => ({
        type: task.type,
        hours: task.hours,
        percentage: totalTaskHours > 0 ? (task.hours / totalTaskHours) * 100 : 0
      }));
      
      console.log("Distribution des tâches avec pourcentages calculés:", taskDistributionWithPercentage);
      
      try {
        console.log("Appel à exportTimeReportToPDF");
        await exportTimeReportToPDF(
          formattedMonth,
          {
            daily: dailyHours,
            weekly: weeklyHours,
            monthly: monthlyHours
          },
          taskDistributionWithPercentage,
          data.summary.topEquipment,
          `rapport-temps-${format(month, 'yyyy-MM')}`
        );
        console.log("PDF exporté avec succès");
        toast.success("Rapport PDF exporté avec succès");
      } catch (error) {
        console.error("Erreur lors de l'appel à exportTimeReportToPDF:", error);
        toast.error("Erreur lors de la génération du PDF");
      }
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export du PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      toast.info("Génération du fichier Excel...");
      console.log("Début de l'export Excel");
      
      const data = await fetchExportData();
      if (!data) {
        console.error("Aucune donnée à exporter");
        toast.error("Aucune donnée à exporter");
        return;
      }
      
      console.log("Données récupérées pour l'export Excel");
      exportEntriesToExcel(data.tasks);
      console.log("Excel exporté avec succès");
      
      toast.success("Rapport Excel exporté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      toast.error("Erreur lors de l'export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPdf,
    exportToExcel,
    isExporting
  };
}
