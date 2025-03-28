
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

interface InstallationSectionProps {
  installation: string;
  isInfoAvailable: (info: string) => boolean;
}

export const InstallationSection: React.FC<InstallationSectionProps> = ({ 
  installation,
  isInfoAvailable
}) => {
  if (!isInfoAvailable(installation)) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          Guide d'installation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line">{installation}</div>
      </CardContent>
    </Card>
  );
};
