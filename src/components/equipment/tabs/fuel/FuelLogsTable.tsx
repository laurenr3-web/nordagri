
import { FuelLog } from '@/types/FuelLog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface FuelLogsTableProps {
  logs: FuelLog[];
}

export function FuelLogsTable({ logs }: FuelLogsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Quantité (L)</TableHead>
          <TableHead>Prix/L (€)</TableHead>
          <TableHead>Coût total (€)</TableHead>
          <TableHead>Heures</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.date), 'dd/MM/yyyy')}</TableCell>
            <TableCell>{log.fuel_quantity_liters.toFixed(2)}</TableCell>
            <TableCell>{log.price_per_liter.toFixed(3)}</TableCell>
            <TableCell>{log.total_cost.toFixed(2)}</TableCell>
            <TableCell>{log.hours_at_fillup?.toFixed(1) || '-'}</TableCell>
            <TableCell className="max-w-xs truncate">{log.notes || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
