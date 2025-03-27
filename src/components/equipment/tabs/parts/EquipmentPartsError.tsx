
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface EquipmentPartsErrorProps {
  error: string;
}

const EquipmentPartsError: React.FC<EquipmentPartsErrorProps> = ({ error }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pièces compatibles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-destructive flex items-center justify-center py-8">
          <p>Erreur: {error}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentPartsError;
