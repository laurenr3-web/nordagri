
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const EquipmentPartsLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pièces compatibles</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Chargement des pièces...</p>
      </CardContent>
    </Card>
  );
};

export default EquipmentPartsLoading;
