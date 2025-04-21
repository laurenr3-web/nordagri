
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
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { DeleteFuelLogAlert } from './DeleteFuelLogAlert';

interface FuelLogsTableProps {
  logs: FuelLog[];
  onDelete?: (fuelLogId: string) => void;
  isDeletingId?: string | null;
}

export function FuelLogsTable({ logs, onDelete, isDeletingId }: FuelLogsTableProps) {
  const [alertOpenId, setAlertOpenId] = React.useState<string | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Quantité (L)</TableHead>
            <TableHead>Prix/L ($)</TableHead>
            <TableHead>Coût total ($)</TableHead>
            <TableHead>Heures</TableHead>
            <TableHead>Notes</TableHead>
            {onDelete && <TableHead>Actions</TableHead>}
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
              {onDelete &&
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAlertOpenId(log.id)}
                    disabled={isDeletingId === log.id}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <DeleteFuelLogAlert
                    open={alertOpenId === log.id}
                    onOpenChange={(open) => setAlertOpenId(open ? log.id : null)}
                    onConfirm={() => {
                      setAlertOpenId(null);
                      onDelete?.(log.id);
                    }}
                  />
                </TableCell>
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
