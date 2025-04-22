
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FuelLog } from '@/types/FuelLog';
import { exportToPDF } from '@/utils/pdfExport';

export interface ExportableFuelLog {
  date: string;
  quantity: string;
  price: string;
  totalCost: string;
  hours: string;
  notes: string;
}

export function useFuelLogsExport() {
  const formatLogsForExport = (logs: FuelLog[]): ExportableFuelLog[] => {
    return logs.map(log => ({
      date: format(new Date(log.date), 'dd/MM/yyyy', { locale: fr }),
      quantity: `${log.fuel_quantity_liters.toFixed(2)} L`,
      price: `${log.price_per_liter.toFixed(2)} €/L`,
      totalCost: `${(log.total_cost || log.fuel_quantity_liters * log.price_per_liter).toFixed(2)} €`,
      hours: log.hours_at_fillup ? log.hours_at_fillup.toString() : '-',
      notes: log.notes || ''
    }));
  };

  const exportFuelLogsToPDF = async (
    logs: FuelLog[],
    equipmentName: string
  ) => {
    const formattedLogs = formatLogsForExport(logs);
    
    const headers = [
      { label: 'Date', key: 'date' },
      { label: 'Quantité', key: 'quantity' },
      { label: 'Prix unitaire', key: 'price' },
      { label: 'Coût total', key: 'totalCost' },
      { label: 'Heures moteur', key: 'hours' },
      { label: 'Notes', key: 'notes' }
    ];
    
    const title = 'Journal de carburant';
    const subtitle = `Équipement: ${equipmentName}`;
    const filename = `carburant-${equipmentName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}`;
    
    await exportToPDF(formattedLogs, headers, title, subtitle, filename);
  };

  return {
    formatLogsForExport,
    exportFuelLogsToPDF,
    headers: [
      { label: 'Date', key: 'date' },
      { label: 'Quantité', key: 'quantity' },
      { label: 'Prix unitaire', key: 'price' },
      { label: 'Coût total', key: 'totalCost' },
      { label: 'Heures moteur', key: 'hours' },
      { label: 'Notes', key: 'notes' }
    ]
  };
}
