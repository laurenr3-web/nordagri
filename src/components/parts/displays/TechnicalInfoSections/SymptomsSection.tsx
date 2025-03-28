
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface SymptomsSectionProps {
  symptoms: string;
  isInfoAvailable: (info: string) => boolean;
}

export const SymptomsSection: React.FC<SymptomsSectionProps> = ({ 
  symptoms,
  isInfoAvailable
}) => {
  if (!isInfoAvailable(symptoms)) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Symptômes de défaillance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line">{symptoms}</div>
      </CardContent>
    </Card>
  );
};
