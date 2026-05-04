import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fuel, Plus } from 'lucide-react';
import { useFuelLogs } from '@/hooks/equipment/useFuelLogs';
import { FuelLogDialog } from '@/components/equipment/tabs/fuel/FuelLogDialog';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props { equipment: EquipmentItem; canEdit?: boolean; }

const FuelSummaryCard: React.FC<Props> = ({ equipment, canEdit = true }) => {
  const eqId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;
  const { fuelLogs, isLoading, addFuelLog, isAddDialogOpen, setIsAddDialogOpen } = useFuelLogs(eqId);

  const last = fuelLogs?.[0];
  const now = new Date();
  const monthLogs = (fuelLogs || []).filter((l: any) => {
    const d = new Date(l.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = monthLogs.reduce((s: number, l: any) => s + (Number(l.fuel_quantity_liters) || 0), 0);
  const monthCost = monthLogs.reduce((s: number, l: any) =>
    s + ((Number(l.fuel_quantity_liters) || 0) * (Number(l.price_per_liter) || 0)), 0);

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Fuel className="h-4 w-4 text-emerald-600" /> Carburant
        </CardTitle>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Plein
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-12 rounded-lg bg-muted animate-pulse" />
        ) : !last ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun plein enregistré.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernier plein</span>
              <span className="font-medium">{last.fuel_quantity_liters} L · {format(new Date(last.date), 'd MMM', { locale: fr })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total ce mois</span>
              <span className="font-medium">{monthTotal.toFixed(0)} L</span>
            </div>
            {monthCost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût ce mois</span>
                <span className="font-medium">{monthCost.toFixed(2)} $</span>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <FuelLogDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={(v) => addFuelLog.mutate(v)}
        isSubmitting={addFuelLog.isPending}
        equipmentId={eqId}
        currentHours={equipment.valeur_actuelle ?? undefined}
      />
    </Card>
  );
};

export default FuelSummaryCard;