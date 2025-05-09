
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { Part } from '@/types/Part';

interface WithdrawalHistoryProps {
  part: Part;
}

interface WithdrawalRecord {
  id: number;
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason?: string | null;
  intervention_id?: number | null;
  comment?: string | null;
  user_id?: string | null;
  created_at: string;
  interventions?: {
    id: number;
    title: string;
  } | null;
}

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ part }) => {
  const { getWithdrawalHistory, WITHDRAWAL_REASONS } = usePartsWithdrawal();
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure we're working with a numeric part ID
  const partId = typeof part.id === 'string' ? parseInt(part.id, 10) : part.id;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching withdrawal history for part ID:', partId);
        
        // Safely fetch withdrawal history
        if (isNaN(partId)) {
          console.error('Invalid part ID:', part.id);
          setError('ID de pièce invalide');
          setHistory([]);
          return;
        }
        
        const data = await getWithdrawalHistory(partId);
        console.log('Withdrawal history data received:', data);
        setHistory(Array.isArray(data) ? data as WithdrawalRecord[] : []);
      } catch (err) {
        console.error('Error fetching withdrawal history:', err);
        setError('Erreur lors du chargement de l\'historique');
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a valid part ID
    if (part && part.id) {
      fetchHistory();
    } else {
      setIsLoading(false);
      setError('Informations de pièce manquantes');
    }
  }, [partId, getWithdrawalHistory, part]);

  // Format reason for display
  const formatReason = (record: WithdrawalRecord) => {
    if (record.reason === 'other' && record.custom_reason) {
      return record.custom_reason;
    }
    
    const reasonObj = WITHDRAWAL_REASONS.find(r => r.id === record.reason);
    return reasonObj ? reasonObj.label : record.reason;
  };

  // Export history to Excel format
  const handleExport = () => {
    if (!history.length) return;

    try {
      const exportData = history.map(record => ({
        Date: format(new Date(record.created_at), 'dd/MM/yyyy HH:mm'),
        Quantité: record.quantity,
        Raison: formatReason(record),
        Intervention: record.interventions?.title || '-',
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
      setError('Erreur lors de l\'export des données');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Historique des retraits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Historique des retraits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {history.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mt-2">Aucun retrait enregistré pour cette pièce</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(record => (
              <div key={record.id} className="border-b pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">{record.quantity} unité(s)</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(record.created_at), 'dd MMMM yyyy, HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm space-y-1 mt-1">
                  <div>
                    <span className="font-medium">Raison:</span> {formatReason(record)}
                  </div>
                  
                  {record.interventions && (
                    <div>
                      <span className="font-medium">Intervention:</span> {record.interventions.title}
                    </div>
                  )}
                  
                  {record.comment && (
                    <div>
                      <span className="font-medium">Commentaire:</span> {record.comment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalHistory;
