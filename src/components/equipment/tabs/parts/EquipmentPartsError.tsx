
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        <Alert variant="destructive" className="border-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-destructive font-medium">
            Erreur de chargement
          </AlertTitle>
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EquipmentPartsError;
