import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { NewPointDialog } from '@/components/points/NewPointDialog';
import { PointDetailDialog } from '@/components/points/PointDetailDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props { equipment: EquipmentItem; }

const EquipmentPointsList: React.FC<Props> = ({ equipment }) => {
  const { farmId } = useFarmId();
  const qc = useQueryClient();
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const { data: points = [] } = useQuery({
    queryKey: ['equipment-points-full', farmId, equipment.id],
    enabled: !!farmId,
    queryFn: async () => {
      const eqIdStr = String(equipment.id);
      let { data } = await supabase.from('points').select('*')
        .eq('farm_id', farmId!).eq('type', 'equipement')
        .eq('entity_id', eqIdStr).order('last_event_at', { ascending: false });
      if ((!data || !data.length) && equipment.name) {
        const fb = await supabase.from('points').select('*')
          .eq('farm_id', farmId!).eq('type', 'equipement')
          .ilike('entity_label', `%${equipment.name}%`).order('last_event_at', { ascending: false });
        data = fb.data ?? [];
      }
      return data ?? [];
    },
  });

  const badge = (p: string) =>
    p === 'critical' ? <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Critique</Badge>
    : p === 'important' ? <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">Important</Badge>
    : <Badge variant="outline" className="text-[10px]">Normal</Badge>;

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4 text-blue-600" /> Points</CardTitle>
        {farmId && (
          <Button size="sm" variant="outline" onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun point.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {points.map((p: any) => (
              <button key={p.id} onClick={() => setSelected(p)}
                className="w-full text-left rounded-xl border p-3 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-snug line-clamp-2 break-words safe-text">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {badge(p.priority)}
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(p.last_event_at), 'd MMM', { locale: fr })}
                      </span>
                      {p.status === 'resolved' && <Badge variant="secondary" className="text-[10px]">Résolu</Badge>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      {farmId && (
        <NewPointDialog
          open={newOpen}
          onOpenChange={(o) => { setNewOpen(o); if (!o) qc.invalidateQueries({ queryKey: ['equipment-points-full'] }); }}
          farmId={farmId}
          defaultValues={{ type: 'equipement', entityLabel: equipment.name }}
        />
      )}
      <PointDetailDialog point={selected} open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }} />
    </Card>
  );
};

export default EquipmentPointsList;