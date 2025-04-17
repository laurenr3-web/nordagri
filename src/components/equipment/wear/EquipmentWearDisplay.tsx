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
      <CardHeader className="p-4 md:p-6 pb-2">
        <CardTitle className="text-base md:text-lg font-medium text-center md:text-left">Usure</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-2">
        <div className="flex flex-col gap-3">
          <p className="text-xl md:text-2xl font-bold text-center md:text-left">{formattedValue}</p>
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-start">
              <CalendarClock className="h-4 w-4 flex-shrink-0" />
              <span>Mis à jour {lastUpdate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
