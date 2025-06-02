
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

interface UsageComparisonProps {
  equipment: EquipmentItem[];
}

export const UsageComparison: React.FC<UsageComparisonProps> = ({ equipment }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Utilisation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${equipment.length}, 1fr)` }}>
          {equipment.map((item) => (
            <div key={item.id} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(item as any).usage?.hours || (item as any).valeur_actuelle || 0}h
              </div>
              <div className="text-sm text-muted-foreground">
                Heures d'utilisation
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
