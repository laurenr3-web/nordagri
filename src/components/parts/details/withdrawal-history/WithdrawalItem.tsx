
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { WithdrawalRecord } from '@/hooks/parts/withdrawal/types';

interface WithdrawalItemProps {
  record: WithdrawalRecord;
  formatWithdrawalReason: (reason: string, customReason?: string | null) => string;
}

const WithdrawalItem: React.FC<WithdrawalItemProps> = ({ record, formatWithdrawalReason }) => {
  return (
    <div className="border-b pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
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
          <span className="font-medium">Raison:</span> {formatWithdrawalReason(record.reason, record.custom_reason)}
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
  );
};

export default WithdrawalItem;
