
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface AlternativesSectionProps {
  alternatives: string[];
}

export const AlternativesSection: React.FC<AlternativesSectionProps> = ({ alternatives }) => {
  if (!alternatives || alternatives.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Alternatives possibles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1">
          {alternatives.map((alternative, index) => (
            <li key={index}>{alternative}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
