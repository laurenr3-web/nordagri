
import React from 'react';
import { FuelLog } from '@/types/FuelLog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FuelLogsTableProps {
  logs: FuelLog[];
  onDelete: (id: string) => void;
  isDeletingId: string | null;
}

export function FuelLogsTable({ logs, onDelete, isDeletingId }: FuelLogsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Quantité (L)</TableHead>
            <TableHead>Prix (€/L)</TableHead>
            <TableHead>Total (€)</TableHead>
            <TableHead>Heures</TableHead>
            <TableHead>Km</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {log.date ? format(new Date(log.date), 'dd MMM yyyy', { locale: fr }) : '-'}
              </TableCell>
              <TableCell>{log.fuel_quantity_liters?.toFixed(1) || '-'}</TableCell>
              <TableCell>{log.price_per_liter?.toFixed(2) || '-'}</TableCell>
              <TableCell>{log.total_cost?.toFixed(2) || '-'}</TableCell>
              <TableCell>{log.hours_at_fillup ?? '-'}</TableCell>
              <TableCell>{log.km_at_fillup ?? '-'}</TableCell>
              <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(log.id)}
                  disabled={isDeletingId === log.id}
                >
                  {isDeletingId === log.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
