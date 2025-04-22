
import { formatDuration } from '@/utils/dateHelpers';
import { TimeEntry } from './types';
import { exportToPDF } from '@/utils/pdfExport';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ExportableTimeEntry {
  date: string;
  start_time: string;
  end_time: string;
  duration: string;
  task_type: string;
  equipment_name: string;
  notes: string;
  status: string;
}

export function useExportTimeTracking() {
  const formatEntriesForExport = (entries: TimeEntry[]): ExportableTimeEntry[] => {
    return entries.map(entry => {
      const startTime = new Date(entry.start_time);
      const endTime = entry.end_time ? new Date(entry.end_time) : null;
      let duration = '';
      
      if (entry.duration) {
        // If we have a stored duration in hours, format it as HH:MM:SS
        const hours = Math.floor(entry.duration);
        const minutes = Math.floor((entry.duration - hours) * 60);
        const seconds = Math.floor(((entry.duration - hours) * 60 - minutes) * 60);
        duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else if (entry.current_duration) {
        // If we have a pre-formatted duration string
        duration = entry.current_duration;
      } else if (endTime) {
        // Calculate duration if we have start and end times
        const durationMs = endTime.getTime() - startTime.getTime();
        duration = formatDuration(durationMs);
      }

      return {
        date: format(startTime, 'dd/MM/yyyy', { locale: fr }),
        start_time: format(startTime, 'HH:mm', { locale: fr }),
        end_time: endTime ? format(endTime, 'HH:mm', { locale: fr }) : '-',
        duration: duration || '00:00:00',
        task_type: entry.custom_task_type || entry.task_type || '-',
        equipment_name: entry.equipment_name || '-',
        notes: entry.notes || '',
        status: translateStatus(entry.status)
      };
    });
  };

  const translateStatus = (status: string): string => {
    switch (status) {
      case 'active': return 'En cours';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  const exportTimeEntriesToPDF = async (entries: TimeEntry[], periodLabel: string) => {
    const formattedEntries = formatEntriesForExport(entries);
    
    const headers = [
      { label: 'Date', key: 'date' },
      { label: 'Début', key: 'start_time' },
      { label: 'Fin', key: 'end_time' },
      { label: 'Durée', key: 'duration' },
      { label: 'Type', key: 'task_type' },
      { label: 'Équipement', key: 'equipment_name' },
      { label: 'Statut', key: 'status' },
      { label: 'Notes', key: 'notes' }
    ];
    
    const title = 'Suivi du temps';
    const subtitle = `Période: ${periodLabel}`;
    const filename = `suivi-temps-${format(new Date(), 'yyyy-MM-dd')}`;
    
    await exportToPDF(formattedEntries, headers, title, subtitle, filename);
  };

  return {
    formatEntriesForExport,
    exportTimeEntriesToPDF,
    headers: [
      { label: 'Date', key: 'date' },
      { label: 'Début', key: 'start_time' },
      { label: 'Fin', key: 'end_time' },
      { label: 'Durée', key: 'duration' },
      { label: 'Type', key: 'task_type' },
      { label: 'Équipement', key: 'equipment_name' },
      { label: 'Statut', key: 'status' },
      { label: 'Notes', key: 'notes' }
    ]
  };
}
