
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { TopEquipment } from '@/hooks/time-tracking/useTopEquipment';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { exportTimeReportToPDF } from '@/utils/pdfExport';
import { exportToExcel, ExcelColumn } from '@/utils/excelExport';

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
    // Convert taskDistribution to the required format
    const formattedTaskDistribution = taskDistribution.map(task => ({
      type: task.type,
      hours: task.hours,
      percentage: (task.hours / summary.monthly) * 100
    }));
    
    // Export to PDF
    exportTimeReportToPDF(
      month,
      summary,
      formattedTaskDistribution,
      topEquipment,
      `rapport-temps-${format(new Date(), 'yyyy-MM')}`
    );
  };

  // Export entries to Excel
  const exportEntriesToExcel = (entries: TimeEntry[]) => {
    const formattedData = formatEntriesForExport(entries);
    
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
  };

  return {
    exportReportToPDF,
    exportEntriesToExcel,
    formatEntriesForExport
  };
};
