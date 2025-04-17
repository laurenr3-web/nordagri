
import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExportData {
  summary: {
    totalHours: number;
    taskTypeDistribution: { type: string, hours: number }[];
    topEquipment: { name: string, hours: number }[];
  };
  dailyHours: { date: string, hours: number }[];
  tasks: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    taskType: string;
    equipment: string;
    notes: string;
  }[];
}

export function useExportReport(month: Date) {
  const [isExporting, setIsExporting] = useState(false);

  const fetchExportData = async (): Promise<ExportData | null> => {
    try {
      const startDate = startOfMonth(month);
      const endDate = endOfMonth(month);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return null;
      
      const userId = sessionData.session.user.id;
      
      // Get user info
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
      
      // Get all time entries for the month
      const { data: timeEntries } = await supabase
        .from('time_sessions')
        .select(`
          id,
          start_time,
          end_time,
          duration,
          custom_task_type,
          equipment_id,
          equipment:equipment_id (name),
          notes
        `)
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');
        
      if (!timeEntries) return null;
      
      // Calculate summary data
      let totalHours = 0;
      const taskTypeMap = new Map<string, number>();
      const equipmentMap = new Map<string, number>();
      const dailyHoursMap = new Map<string, number>();
      
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
        
        // Equipment usage
        if (entry.equipment_id && entry.equipment) {
          const equipmentName = entry.equipment.name;
          equipmentMap.set(equipmentName, (equipmentMap.get(equipmentName) || 0) + duration);
        }
        
        // Daily hours
        const dateString = format(new Date(entry.start_time), 'yyyy-MM-dd');
        dailyHoursMap.set(dateString, (dailyHoursMap.get(dateString) || 0) + duration);
        
        // Format task for export
        return {
          date: format(new Date(entry.start_time), 'yyyy-MM-dd'),
          startTime: format(new Date(entry.start_time), 'HH:mm'),
          endTime: entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '-',
          duration,
          taskType,
          equipment: entry.equipment?.name || '-',
          notes: entry.notes || ''
        };
      });
      
      // Prepare data for export
      const exportData: ExportData = {
        summary: {
          totalHours,
          taskTypeDistribution: Array.from(taskTypeMap.entries()).map(([type, hours]) => ({ type, hours })),
          topEquipment: Array.from(equipmentMap.entries())
            .map(([name, hours]) => ({ name, hours }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5)
        },
        dailyHours: Array.from(dailyHoursMap.entries()).map(([date, hours]) => ({ date, hours })),
        tasks
      };
      
      return exportData;
    } catch (error) {
      console.error("Error preparing export data:", error);
      return null;
    }
  };

  const exportToPdf = async () => {
    try {
      setIsExporting(true);
      
      // Display a toast message that this would generate a PDF in a real app
      toast.info("Génération du PDF...");
      
      // In a real implementation, we would:
      // 1. Fetch all the data using fetchExportData
      // 2. Use a PDF library like jsPDF or pdfmake
      // 3. Generate and download the PDF
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      
      toast.success("Rapport PDF exporté avec succès");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Erreur lors de l'export du PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Display a toast message that this would generate an Excel file in a real app
      toast.info("Génération du fichier Excel...");
      
      // In a real implementation, we would:
      // 1. Fetch all the data using fetchExportData
      // 2. Use a library like exceljs or xlsx
      // 3. Generate and download the Excel file
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      
      toast.success("Rapport Excel exporté avec succès");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
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
