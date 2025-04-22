
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FuelLog } from '@/types/FuelLog';
import { exportToExcel, ExcelColumn } from '@/utils/excelExport';

export interface FuelLogExportData {
  date: string;
  equipment: string;
  quantity: number;
  price: number;
  total: number;
  hours: number | string;
  notes: string;
}

export const useFuelLogsExport = () => {
  // Format fuel logs for export
  const formatLogsForExport = (logs: FuelLog[], equipmentName?: string): FuelLogExportData[] => {
    return logs.map(log => ({
      date: format(new Date(log.date), 'dd/MM/yyyy', { locale: fr }),
      equipment: equipmentName || `Équipement #${log.equipment_id}`,
      quantity: log.fuel_quantity_liters,
      price: log.price_per_liter,
      total: log.total_cost,
      hours: log.hours_at_fillup?.toString() || '-',
      notes: log.notes || ''
    }));
  };

  // Export to Excel
  const exportFuelLogsToExcel = (logs: FuelLog[], equipmentName?: string) => {
    const formattedData = formatLogsForExport(logs, equipmentName);
    
    const columns: ExcelColumn[] = [
      { key: 'date', header: 'Date' },
      { key: 'equipment', header: 'Équipement' },
      { key: 'quantity', header: 'Quantité (L)' },
      { key: 'price', header: 'Prix/L (€)' },
      { key: 'total', header: 'Total (€)' },
      { key: 'hours', header: 'Heures compteur' },
      { key: 'notes', header: 'Notes' }
    ];
    
    exportToExcel(
      formattedData,
      columns,
      `carburant-${format(new Date(), 'yyyy-MM-dd')}`,
      'Registre carburant'
    );
  };

  return {
    exportToExcel: exportFuelLogsToExcel,
    formatLogsForExport
  };
};
