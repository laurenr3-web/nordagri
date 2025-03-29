
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TechnicalInfoHeaderProps {
  lastUpdated: Date | null;
  formatDate: (date: Date | null) => string;
  onRefresh: () => void;
  isLoading: boolean;
  isApiKeyValid: boolean | null;
}

export const TechnicalInfoHeader: React.FC<TechnicalInfoHeaderProps> = ({
  lastUpdated,
  formatDate,
  onRefresh,
  isLoading,
  isApiKeyValid
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-2xl font-bold">Informations techniques</h2>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Dernière mise à jour: {formatDate(lastUpdated)}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isLoading || !isApiKeyValid}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
