
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';

interface AlternativesSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const AlternativesSection: React.FC<AlternativesSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ArrowRightLeft className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Alternatives & compatibilité</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune information disponible sur les alternatives à la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
