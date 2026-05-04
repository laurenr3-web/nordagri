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
import PointDetailDialog from '@/components/points/PointDetailDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props { equipment: EquipmentItem; canEdit?: boolean; }

const EquipmentPointsCard: React.FC<Props> = ({ equipment, canEdit = true }) => {
  const { farmId } = useFarmId();
  const queryClient = useQueryClient();
  const [newOpen, setNewOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: points = [], isLoading } = useQuery({
    queryKey: ['equipment-points', farmId, equipment.id, equipment.name],
    enabled: !!farmId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('farm_id', farmId!)
        .eq('type', 'equipement')
        .neq('status', 'resolved')
        .ilike('entity_label', `%${equipment.name}%`)
        .order('last_event_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const priorityBadge = (p: string) => {
    if (p === 'critical') return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Critique</Badge>;
    if (p === 'important') return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">Important</Badge>;
    return <Badge variant="outline" className="text-[10px]">Normal</Badge>;
  };

  const observationLabel = [equipment.name, equipment.model].filter(Boolean).join(' ');

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-600" /> Points à surveiller
        </CardTitle>
        {canEdit && farmId && (
          <Button size="sm" variant="outline" onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : points.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun point à surveiller actif.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {points.map((p: any) => (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="w-full text-left rounded-xl border p-3 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {priorityBadge(p.priority)}
                      <span className="text-[11px] text-muted-foreground">
                        {p.next_check_at ? `Vérif. ${format(new Date(p.next_check_at), 'd MMM', { locale: fr })}` :
                          `Maj. ${format(new Date(p.last_event_at), 'd MMM', { locale: fr })}`}
                      </span>
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
          onOpenChange={(o) => {
            setNewOpen(o);
            if (!o) queryClient.invalidateQueries({ queryKey: ['equipment-points'] });
          }}
          farmId={farmId}
          defaultValues={{ type: 'equipement', entityLabel: observationLabel }}
        />
      )}
      <PointDetailDialog
        pointId={selectedId}
        open={!!selectedId}
        onOpenChange={(o) => !o && setSelectedId(null)}
      />
    </Card>
  );
};

export default EquipmentPointsCard;