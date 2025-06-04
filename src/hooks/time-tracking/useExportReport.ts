
import { useState } from 'react';
import { TimeEntry } from './types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function useExportReport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (
    timeEntries: TimeEntry[],
    startDate: Date,
    endDate: Date,
    format: 'detailed' | 'summary' = 'detailed'
  ) => {
    setIsExporting(true);
    
    try {
      if (format === 'detailed') {
        await exportDetailedReport(timeEntries, startDate, endDate);
      } else {
        await exportSummaryReport(timeEntries, startDate, endDate);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportDetailedReport = async (
    timeEntries: TimeEntry[],
    startDate: Date,
    endDate: Date
  ) => {
    const data = timeEntries.map(entry => ({
      Date: format(new Date(entry.start_time), 'dd/MM/yyyy', { locale: fr }),
      'Heure début': format(new Date(entry.start_time), 'HH:mm', { locale: fr }),
      'Heure fin': entry.end_time ? format(new Date(entry.end_time), 'HH:mm', { locale: fr }) : 'En cours',
      Durée: entry.duration ? `${entry.duration.toFixed(2)}h` : 'En cours',
      Employé: entry.user_name || entry.owner_name || 'Non défini',
      Équipement: entry.equipment_name || 'Non défini',
      'Type de tâche': entry.custom_task_type || 'Non défini',
      Location: entry.location || entry.poste_travail || 'Non défini',
      Statut: entry.status === 'active' ? 'Actif' : 
              entry.status === 'paused' ? 'En pause' : 
              entry.status === 'completed' ? 'Terminé' : entry.status,
      Notes: entry.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport détaillé');

    // Ajustement automatique de la largeur des colonnes
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `rapport_detaille_${format(startDate, 'ddMMyyyy')}_${format(endDate, 'ddMMyyyy')}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };

  const exportSummaryReport = async (
    timeEntries: TimeEntry[],
    startDate: Date,
    endDate: Date
  ) => {
    // Grouper par employé et équipement
    const summary = timeEntries.reduce((acc: any, entry) => {
      const employeeName = entry.user_name || entry.owner_name || 'Non défini';
      const equipmentName = entry.equipment_name || 'Non défini';
      const key = `${employeeName}_${equipmentName}`;
      
      if (!acc[key]) {
        acc[key] = {
          employee: employeeName,
          equipment: equipmentName,
          totalHours: 0,
          sessionCount: 0
        };
      }
      
      if (entry.duration) {
        acc[key].totalHours += entry.duration;
      }
      acc[key].sessionCount += 1;
      
      return acc;
    }, {});

    const data = Object.values(summary).map((item: any) => ({
      Employé: item.employee,
      Équipement: item.equipment,
      'Heures totales': `${item.totalHours.toFixed(2)}h`,
      'Nombre de sessions': item.sessionCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Résumé');

    // Ajustement automatique de la largeur des colonnes
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `resume_${format(startDate, 'ddMMyyyy')}_${format(endDate, 'ddMMyyyy')}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };

  return {
    exportToExcel,
    isExporting
  };
}
