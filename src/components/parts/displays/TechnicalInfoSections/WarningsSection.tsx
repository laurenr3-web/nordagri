
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface WarningsSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const WarningsSection: React.FC<WarningsSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <CardTitle className="text-base">Avertissements</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucun avertissement spécifique pour la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
