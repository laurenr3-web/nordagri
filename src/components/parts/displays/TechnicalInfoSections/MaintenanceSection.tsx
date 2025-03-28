
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

interface MaintenanceSectionProps {
  maintenance: string;
  isInfoAvailable: (info: string) => boolean;
}

export const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ 
  maintenance,
  isInfoAvailable
}) => {
  if (!isInfoAvailable(maintenance)) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          Entretien et maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line">{maintenance}</div>
      </CardContent>
    </Card>
  );
};
