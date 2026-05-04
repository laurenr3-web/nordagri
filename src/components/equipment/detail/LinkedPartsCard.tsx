import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useParts } from '@/hooks/useParts';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';

interface Props { equipment: EquipmentItem; canEdit?: boolean; }

const LinkedPartsCard: React.FC<Props> = ({ equipment, canEdit = true }) => {
  const navigate = useNavigate();
  const { parts, isLoading } = useParts();
  const [addOpen, setAddOpen] = useState(false);

  const eqId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;

  const linked = useMemo(() => {
    if (!parts) return [];
    return parts.filter((p: any) => Array.isArray(p.compatibility) && p.compatibility.includes(eqId)).slice(0, 3);
  }, [parts, eqId]);

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Pièces liées
        </CardTitle>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Lier
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-12 rounded-lg bg-muted animate-pulse" />
        ) : linked.length === 0 ? (
          <div className="text-center py-5 text-muted-foreground">
            <Package className="h-7 w-7 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune pièce liée.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {linked.map((p: any) => {
              const lowStock = p.stock != null && p.reorderPoint != null && p.stock <= p.reorderPoint;
              return (
                <button key={p.id} onClick={() => navigate(`/parts?id=${p.id}`)}
                  className="w-full text-left rounded-xl border p-2.5 hover:bg-accent/50 transition-colors flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.stock ?? 0} en stock {lowStock && <span className="text-orange-600 font-medium">· Stock bas</span>}
                    </p>
                  </div>
                  {lowStock && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">Bas</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>

      <AddPartDialog isOpen={addOpen} onOpenChange={setAddOpen} onSuccess={() => setAddOpen(false)} />
    </Card>
  );
};

export default LinkedPartsCard;