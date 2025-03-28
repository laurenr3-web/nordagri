
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface WarningsSectionProps {
  warnings: string;
  isInfoAvailable: (info: string) => boolean;
}

export const WarningsSection: React.FC<WarningsSectionProps> = ({ 
  warnings,
  isInfoAvailable
}) => {
  if (!isInfoAvailable(warnings)) return null;
  
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900">
      <CardHeader>
        <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="h-5 w-5 mr-2" />
          Avertissements importants
        </CardTitle>
      </CardHeader>
      <CardContent className="text-yellow-800 dark:text-yellow-300">
        <div className="whitespace-pre-line">{warnings}</div>
      </CardContent>
    </Card>
  );
};
