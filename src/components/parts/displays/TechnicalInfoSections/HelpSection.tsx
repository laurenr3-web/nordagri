
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

interface HelpSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ partNumber, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Assistance</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <p className="text-sm">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune information d'assistance disponible pour la pièce {partNumber}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
