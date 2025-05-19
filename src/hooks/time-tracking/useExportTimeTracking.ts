
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { TopEquipment } from '@/hooks/time-tracking/useTopEquipment';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { exportToExcel, ExcelColumn } from '@/utils/excelExport';
import { exportTimeReportToPDF, exportTimeEntriesToPDF } from '@/utils/pdf-export/time-tracking-export';

export interface EmployeeHoursData {
  date: string;
  employee: string;
  task: string;
  equipment: string;
  hours: number;
}

export const useExportTimeTracking = () => {
  // Transform TimeEntry to EmployeeHoursData for export
  const formatEntriesForExport = (entries: TimeEntry[]): EmployeeHoursData[] => {
    return entries.map(entry => {
      // Calculate duration if not directly available
      let hours = 0;
      if (entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
      
      return {
        date: format(new Date(entry.start_time), 'dd/MM/yyyy', { locale: fr }),
        employee: entry.owner_name || entry.user_name || 'Inconnu',
        task: entry.custom_task_type || 'Non spécifié',
        equipment: entry.equipment_name || 'Non spécifié',
        hours: Number(hours.toFixed(2))
      };
    });
  };

  // Export report to PDF
  const exportReportToPDF = (
    month: string,
    summary: {
      daily: number;
      weekly: number;
      monthly: number;
    },
    taskDistribution: TaskTypeDistribution[],
    topEquipment: TopEquipment[]
  ) => {
    try {
      console.log("Starting PDF export with data:", {
        month, 
        summary,
        taskDistributionLength: taskDistribution.length,
        topEquipmentLength: topEquipment.length
      });
      
      // Calculate percentages for task types
      const totalTaskHours = taskDistribution.reduce((acc, task) => acc + task.hours, 0);
      const taskDistWithPercentages = taskDistribution.map(task => ({
        ...task,
        percentage: totalTaskHours > 0 ? (task.hours / totalTaskHours) * 100 : 0
      }));
      
      // Safely map topEquipment to ensure name is always defined
      const safeTopEquipment = topEquipment.map(equipment => ({
        ...equipment,
        name: equipment.name || 'Équipement non spécifié',
        id: equipment.id || 0,
        hours: equipment.hours || 0
      }));
      
      // Generate filename with current date
      const filename = `rapport-temps-${format(new Date(), 'yyyy-MM')}`;
      
      console.log("Prepared data for PDF export:", {
        taskDistWithPercentages,
        safeTopEquipment
      });
      
      // Use the updated exportTimeReportToPDF function from our utility
      return exportTimeReportToPDF(
        month,
        summary,
        taskDistWithPercentages,
        safeTopEquipment,
        filename
      );
    } catch (error) {
      console.error("Error in exportReportToPDF:", error);
      throw error;
    }
  };

  // Export entries to Excel
  const exportEntriesToExcel = (entries: TimeEntry[]) => {
    try {
      console.log("Starting Excel export with entries:", entries.length);
      
      const formattedData = formatEntriesForExport(entries);
      console.log("Formatted data for Excel:", formattedData.length);
      
      const columns: ExcelColumn[] = [
        { key: 'date', header: 'Date' },
        { key: 'employee', header: 'Employé' },
        { key: 'task', header: 'Tâche' },
        { key: 'equipment', header: 'Équipement' },
        { key: 'hours', header: 'Heures' }
      ];
      
      exportToExcel(
        formattedData,
        columns,
        `sessions-temps-${format(new Date(), 'yyyy-MM-dd')}`,
        'Sessions de temps'
      );
    } catch (error) {
      console.error("Error in exportEntriesToExcel:", error);
      throw error;
    }
  };

  // Export time entries directly to PDF
  const exportEntriesToPDF = (entries: TimeEntry[], title?: string) => {
    try {
      console.log("Exporting entries to PDF:", entries.length);
      
      const formattedData = formatEntriesForExport(entries);
      const tableData = {
        headers: [
          { key: 'date', label: 'Date' },
          { key: 'employee', label: 'Employé' },
          { key: 'task', label: 'Tâche' },
          { key: 'equipment', label: 'Équipement' },
          { key: 'hours', label: 'Heures' }
        ],
        rows: formattedData
      };
      
      const reportTitle = title || 'Sessions de Temps';
      const subtitle = format(new Date(), 'dd MMMM yyyy', { locale: fr });
      const filename = `sessions-temps-${format(new Date(), 'yyyy-MM-dd')}`;
      
      return exportTimeEntriesToPDF({
        title: reportTitle,
        subtitle,
        tableData
      }, filename);
    } catch (error) {
      console.error("Error in exportEntriesToPDF:", error);
      throw error;
    }
  };

  return {
    exportReportToPDF,
    exportEntriesToExcel,
    exportEntriesToPDF,
    formatEntriesForExport
  };
};
