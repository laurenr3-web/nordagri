
import { useState } from 'react';
import { TimeEntry } from './types';
import { exportToPDF } from '@/utils/pdfExport';

export function useExportTimeTracking() {
  const [isExporting, setIsExporting] = useState(false);

  const formatTimeEntriesForExport = (entries: TimeEntry[]) => {
    return entries.map(entry => {
      // Calculate duration if not provided
      let duration = entry.duration || 0;
      if (!duration && entry.end_time) {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }

      const startDate = new Date(entry.start_time);
      
      return {
        date: startDate.toLocaleDateString(),
        startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: entry.end_time ? new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        duration: duration.toFixed(2) + 'h',
        taskType: entry.custom_task_type || 'Non spécifié',
        equipment: entry.equipment_name || '-',
        notes: entry.notes || '-'
      };
    });
  };

  const exportTimeEntriesToPDF = async (entries: TimeEntry[], title: string) => {
    setIsExporting(true);
    try {
      const formattedEntries = formatTimeEntriesForExport(entries);
      
      const headers = [
        { label: 'Date', key: 'date' },
        { label: 'Début', key: 'startTime' },
        { label: 'Fin', key: 'endTime' },
        { label: 'Durée', key: 'duration' },
        { label: 'Type de tâche', key: 'taskType' },
        { label: 'Équipement', key: 'equipment' },
        { label: 'Notes', key: 'notes' }
      ];
      
      await exportToPDF(
        formattedEntries,
        headers,
        'Suivi du temps',
        title,
        `time-tracking-export-${new Date().toISOString().split('T')[0]}`
      );
      
    } catch (error) {
      console.error('Error exporting time tracking data to PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    formatTimeEntriesForExport,
    exportTimeEntriesToPDF,
    isExporting,
    headers: [
      { label: 'Date', key: 'date' },
      { label: 'Début', key: 'startTime' },
      { label: 'Fin', key: 'endTime' },
      { label: 'Durée', key: 'duration' },
      { label: 'Type de tâche', key: 'taskType' },
      { label: 'Équipement', key: 'equipment' },
      { label: 'Notes', key: 'notes' }
    ]
  };
}
