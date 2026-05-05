import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Wrench, Eye, Gauge, Fuel } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

type Entry = { id: string; date: Date; type: 'maintenance' | 'point' | 'counter' | 'fuel'; title: string; sub?: string };

const iconFor = (t: Entry['type']) => {
  if (t === 'maintenance') return <Wrench className="h-3.5 w-3.5 text-amber-600" />;
  if (t === 'point') return <Eye className="h-3.5 w-3.5 text-blue-600" />;
  if (t === 'counter') return <Gauge className="h-3.5 w-3.5 text-primary" />;
  return <Fuel className="h-3.5 w-3.5 text-emerald-600" />;
};

const groupLabel = (d: Date) => {
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return 'Hier';
  return format(d, 'd MMMM yyyy', { locale: fr });
};

const Props = (equipment: EquipmentItem) => equipment;
interface Props { equipment: EquipmentItem; }

const MachineJournalCard: React.FC<Props> = ({ equipment }) => {
  const { farmId } = useFarmId();
  const eqId = Number(equipment.id);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['machine-journal', eqId, farmId],
    enabled: !!farmId,
    queryFn: async () => {
      const list: Entry[] = [];

      // Maintenance completed
      try {
        const { data: m } = await supabase
          .from('maintenance_tasks')
          .select('id, title, completed_date, status')
          .eq('equipment_id', eqId)
          .eq('status', 'completed')
          .order('completed_date', { ascending: false })
          .limit(5);
        (m ?? []).forEach((t: any) => {
          if (t.completed_date) list.push({ id: `m-${t.id}`, date: new Date(t.completed_date), type: 'maintenance', title: `Maintenance : ${t.title}` });
        });
      } catch { /* noop */ }

      // Points created
      try {
        const { data: p } = await supabase
          .from('points')
          .select('id, title, created_at, entity_label')
          .eq('farm_id', farmId!)
          .eq('type', 'equipement')
          .ilike('entity_label', `%${equipment.name}%`)
          .order('created_at', { ascending: false })
          .limit(5);
        (p ?? []).forEach((x: any) => list.push({ id: `p-${x.id}`, date: new Date(x.created_at), type: 'point', title: `Point ajouté : ${x.title}` }));
      } catch { /* noop */ }

      // Fuel logs
      try {
        const { data: f } = await supabase
          .from('fuel_logs')
          .select('id, date, fuel_quantity_liters')
          .eq('equipment_id', eqId)
          .order('date', { ascending: false })
          .limit(5);
        (f ?? []).forEach((x: any) => list.push({ id: `f-${x.id}`, date: new Date(x.date), type: 'fuel', title: `Plein carburant : ${x.fuel_quantity_liters} L` }));
      } catch { /* noop */ }

      // Counter update
      if (equipment.last_wear_update) {
        list.push({
          id: `c-${equipment.id}`,
          date: new Date(equipment.last_wear_update as any),
          type: 'counter',
          title: `Compteur mis à jour : ${equipment.valeur_actuelle ?? 0}`,
        });
      }

      return list.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    },
  });

  const grouped = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    const k = groupLabel(e.date);
    (acc[k] = acc[k] || []).push(e);
    return acc;
  }, {});

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Journal machine
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Le journal se remplira automatiquement avec les actions effectuées sur cette machine.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day}>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">{day}</p>
                <div className="space-y-1.5">
                  {items.map((e) => (
                    <div key={e.id} className="flex items-start gap-2.5 text-sm min-w-0">
                      <span className="text-muted-foreground tabular-nums text-xs w-12 shrink-0 mt-0.5">{format(e.date, 'HH:mm')}</span>
                      <span className="mt-0.5 shrink-0">{iconFor(e.type)}</span>
                      <span className="min-w-0 flex-1 leading-snug line-clamp-2 break-words safe-text">{e.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MachineJournalCard;