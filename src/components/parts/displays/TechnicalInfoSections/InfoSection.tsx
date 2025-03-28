
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface InfoSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Informations générales</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune information générale disponible pour la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
