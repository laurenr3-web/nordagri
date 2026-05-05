import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { unitShort, getComputedWearValue, isDayUnit } from './statusHelpers';

interface CounterCardProps {
  equipment: EquipmentItem;
  onUpdate: () => void;
  canEdit: boolean;
}

const CounterCard: React.FC<CounterCardProps> = ({ equipment, onUpdate, canEdit }) => {
  const unit = equipment.unite_d_usure || 'heures';
  const value = getComputedWearValue(equipment);
  const lastUpdate = equipment.last_wear_update
    ? format(new Date(equipment.last_wear_update as any), "d MMM yyyy", { locale: fr })
    : null;
  const hasValue = value !== null && value !== undefined;

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Gauge className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Compteur</p>
              {hasValue ? (
                <p className="text-xl font-semibold leading-tight">
                  {value}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    {isDayUnit(unit) ? `jour${(value as number) > 1 ? 's' : ''}` : unitShort(unit)}
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Aucun compteur enregistré</p>
              )}
              {lastUpdate && (
                <p className="text-[11px] text-muted-foreground mt-0.5">Mis à jour le {lastUpdate}</p>
              )}
            </div>
          </div>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={onUpdate} className="shrink-0">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {hasValue ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CounterCard;