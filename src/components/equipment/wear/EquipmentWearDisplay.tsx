
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEquipmentWear } from '@/hooks/equipment/useEquipmentWear';
import { CalendarClock } from 'lucide-react';

interface EquipmentWearDisplayProps {
  equipment: {
    unite_d_usure: string;
    valeur_actuelle: number;
    last_wear_update?: string | Date | null;
  };
}

export function EquipmentWearDisplay({ equipment }: EquipmentWearDisplayProps) {
  const { formattedValue, lastUpdate } = useEquipmentWear(equipment);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Usure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold">{formattedValue}</p>
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              <span>Mis à jour {lastUpdate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
