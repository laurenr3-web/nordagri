
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface MaintenanceSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Maintenance & entretien</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune information disponible sur la maintenance de la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
