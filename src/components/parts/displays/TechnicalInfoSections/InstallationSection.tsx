
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

interface InstallationSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const InstallationSection: React.FC<InstallationSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Installation & montage</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune information disponible sur l'installation de la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
