
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import WithdrawalItem from './WithdrawalItem';
import { WithdrawalRecord } from '@/hooks/parts/withdrawal/types';
import { Part } from '@/types/Part';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface HistoryListProps {
  history: WithdrawalRecord[];
  part: Part;
  formatWithdrawalReason: (reason: string, customReason?: string | null) => string;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, part, formatWithdrawalReason }) => {
  // Export history to Excel format with error handling
  const handleExport = () => {
    if (!history.length) return;

    try {
      const exportData = history.map(record => ({
        Date: format(new Date(record.created_at || record.date), 'dd/MM/yyyy HH:mm'),
        Quantité: record.quantity,
        Raison: formatWithdrawalReason(record.reason, record.custom_reason),
        Intervention: record.interventions?.title || record.intervention_title || '-',
        Commentaire: record.comment || '-'
      }));

      // Create a CSV content
      const headers = Object.keys(exportData[0]).join(',');
      const rows = exportData.map(item => 
        Object.values(item)
          .map(value => typeof value === 'string' ? `"${value}"` : value)
          .join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      // Create and trigger download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `historique_retraits_${part.name?.replace(/\s+/g, '_') || 'piece'}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting withdrawal history:', e);
      toast.error("Erreur lors de l'export des données");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Historique des retraits</CardTitle>
        
        <Button variant="outline" size="sm" onClick={handleExport} disabled={history.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {history.map(record => (
            <WithdrawalItem 
              key={record.id} 
              record={record} 
              formatWithdrawalReason={formatWithdrawalReason}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryList;
