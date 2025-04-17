
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEquipmentWear } from '@/hooks/equipment/useEquipmentWear';
import { CalendarClock } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EquipmentWearDisplayProps {
  equipment: {
    unite_d_usure?: string;
    valeur_actuelle?: number;
    last_wear_update?: string | Date | null;
  };
}

export function EquipmentWearDisplay({ equipment }: EquipmentWearDisplayProps) {
  const { formattedValue, lastUpdate } = useEquipmentWear({
    unite_d_usure: equipment.unite_d_usure || 'heures',
    valeur_actuelle: equipment.valeur_actuelle || 0,
    last_wear_update: equipment.last_wear_update
  });
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${isMobile ? 'px-4 py-3' : 'p-6'} pb-2`}>
        <CardTitle className="text-lg font-medium">Usure</CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} pt-2`}>
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-bold">{formattedValue}</p>
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4 flex-shrink-0" />
              <span>Mis à jour {lastUpdate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
