
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentPartsProps {
  equipment: EquipmentItem;
}

const EquipmentParts: React.FC<EquipmentPartsProps> = ({ equipment }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pièces détachées</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Aucune pièce détachée n'est associée à cet équipement pour le moment.
        </p>
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
