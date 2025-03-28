
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface SymptomsSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const SymptomsSection: React.FC<SymptomsSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <CardTitle className="text-base">Symptômes de défaillance</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucun symptôme de défaillance documenté pour la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
