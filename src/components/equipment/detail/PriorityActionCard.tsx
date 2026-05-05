import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Eye, ChevronRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import MaintenanceTaskDetailDialog from '@/components/maintenance/dialogs/MaintenanceTaskDetailDialog';
import { PointDetailDialog } from '@/components/points/PointDetailDialog';
import { useEquipmentSnapshot } from './useEquipmentSnapshot';
import { cn } from '@/lib/utils';

interface Props {
  equipment: EquipmentItem;
  onNavigateToTab?: (tab: string) => void;
}

type ItemKind =
  | 'maintenance-overdue'
  | 'point-critical'
  | 'maintenance-soon'
  | 'point-important';
type Item = { kind: ItemKind; raw: any; title: string; meta: string };

const COLLAPSED_LIMIT = 4;

const PriorityActionCard: React.FC<Props> = ({ equipment, onNavigateToTab }) => {
  const snap = useEquipmentSnapshot(equipment);
  const [openTask, setOpenTask] = useState<any>(null);
  const [openPoint, setOpenPoint] = useState<any>(null);

  const [showAll, setShowAll] = useState(false);

  const items = useMemo<Item[]>(() => {
    const formatRetard = (t: any) => {
        if (t.dueDate) {
          const d = Math.floor((Date.now() - new Date(t.dueDate).getTime()) / 86400000);
          return `Maintenance · Retard de ${d} j`;
        }
        return 'Maintenance · En retard';
    };
    const formatSoon = (t: any) => {
        if (!t.dueDate) return 'Maintenance · Planifiée';
        const d = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
        if (d <= 0) return 'Maintenance · Aujourd\'hui';
        if (d === 1) return 'Maintenance · Demain';
        return `Maintenance · Dans ${d} j`;
    };
    return [
      ...snap.overdueTasks.map<Item>((t) => ({ kind: 'maintenance-overdue', raw: t, title: t.title, meta: formatRetard(t) })),
      ...snap.criticalPoints.map<Item>((p) => ({ kind: 'point-critical', raw: p, title: p.title, meta: 'Point · Critique' })),
      ...snap.upcomingTasks.slice(0, 3).map<Item>((t) => ({ kind: 'maintenance-soon', raw: t, title: t.title, meta: formatSoon(t) })),
      ...snap.importantPoints.map<Item>((p) => ({ kind: 'point-important', raw: p, title: p.title, meta: 'Point · Important' })),
    ];
  }, [snap]);

  const top = items[0];
  const isOverdueTop = top?.kind === 'maintenance-overdue';
  const isCriticalTop = top?.kind === 'point-critical';

  const visible = showAll ? items : items.slice(0, COLLAPSED_LIMIT);
  const hidden = items.length - visible.length;

  const openItem = (it: Item) => {
    if (it.kind === 'maintenance-overdue' || it.kind === 'maintenance-soon') setOpenTask(it.raw);
    else setOpenPoint(it.raw);
  };

  const seeAllLink = () => {
    if (!onNavigateToTab) return;
    const hasMaint = items.some((i) => i.kind === 'maintenance-overdue' || i.kind === 'maintenance-soon');
    onNavigateToTab(hasMaint ? 'maintenance' : 'points');
  };

  const counts = {
    overdue: items.filter((i) => i.kind === 'maintenance-overdue').length,
    soon: items.filter((i) => i.kind === 'maintenance-soon').length,
    critical: items.filter((i) => i.kind === 'point-critical').length,
    important: items.filter((i) => i.kind === 'point-important').length,
  };

  const titleId = 'priority-action-card-title';
  const itemsListId = 'priority-action-card-items';
  const moreBtnId = 'priority-action-card-more';

  const itemAriaLabel = (it: Item) => {
    const kindLabel =
      it.kind === 'maintenance-overdue' ? 'Maintenance en retard'
      : it.kind === 'maintenance-soon' ? 'Maintenance à venir'
      : it.kind === 'point-critical' ? 'Point critique'
      : 'Point important';
    return `${kindLabel} : ${it.title}. ${it.meta}. Ouvrir le détail.`;
  };

  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      className={cn(
        'rounded-2xl border border-border/60 shadow-sm',
        isOverdueTop ? 'bg-red-50/60 dark:bg-red-950/20'
        : isCriticalTop ? 'bg-orange-50/60 dark:bg-orange-950/20'
        : 'bg-card',
      )}
    >
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle id={titleId} className="text-sm font-semibold">À faire sur cette machine</CardTitle>
        {items.length > 0 && (
          <span className="text-[11px] text-muted-foreground" aria-label={`${items.length} élément${items.length > 1 ? 's' : ''} à traiter`}>
            {items.length} élément{items.length > 1 ? 's' : ''}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {items.length === 0 ? (
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground py-3"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
            Rien à faire pour le moment.
          </div>
        ) : (
          <>
            {(counts.overdue + counts.critical + counts.important + counts.soon) > 0 && (
              <div
                className="flex flex-wrap gap-1.5 pb-1"
                role="group"
                aria-label="Résumé des éléments par priorité"
              >
                {counts.overdue > 0 && <Badge variant="destructive" className="text-[10px]">{counts.overdue} en retard</Badge>}
                {counts.critical > 0 && <Badge className="bg-red-600 text-white text-[10px]">{counts.critical} critique{counts.critical > 1 ? 's' : ''}</Badge>}
                {counts.important > 0 && <Badge className="bg-orange-500 text-white text-[10px]">{counts.important} important{counts.important > 1 ? 's' : ''}</Badge>}
                {counts.soon > 0 && <Badge variant="outline" className="text-[10px]">{counts.soon} à venir</Badge>}
              </div>
            )}

            <ul
              id={itemsListId}
              className="space-y-1.5"
              aria-label={`Liste des ${items.length} élément${items.length > 1 ? 's' : ''} à traiter`}
            >
              {visible.map((it, idx) => {
                const isMaint = it.kind === 'maintenance-overdue' || it.kind === 'maintenance-soon';
                const overdue = it.kind === 'maintenance-overdue';
                const critical = it.kind === 'point-critical';
                const important = it.kind === 'point-important';
                return (
                  <li key={`${it.kind}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => openItem(it)}
                      aria-label={itemAriaLabel(it)}
                      className="w-full text-left flex items-center gap-3 rounded-xl bg-background/70 border border-border/40 p-2.5 hover:bg-accent/40 hover:border-primary/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <div
                        aria-hidden="true"
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                          overdue ? 'bg-red-100 text-red-700'
                          : critical ? 'bg-red-100 text-red-700'
                          : isMaint ? 'bg-amber-100 text-amber-700'
                          : 'bg-orange-100 text-orange-700',
                        )}
                      >
                        {isMaint ? <Wrench className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug line-clamp-2 break-words safe-text">{it.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{it.meta}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                        {overdue && <Badge variant="destructive" className="text-[10px]">Retard</Badge>}
                        {critical && <Badge className="bg-red-600 text-white text-[10px]">Critique</Badge>}
                        {important && <Badge className="bg-orange-500 text-white text-[10px]">Important</Badge>}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between pt-1">
              {hidden > 0 ? (
                <button
                  type="button"
                  id={moreBtnId}
                  onClick={() => setShowAll(true)}
                  aria-controls={itemsListId}
                  aria-expanded={false}
                  aria-label={`Afficher les ${hidden} élément${hidden > 1 ? 's' : ''} supplémentaire${hidden > 1 ? 's' : ''}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Afficher {hidden} de plus <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : items.length > COLLAPSED_LIMIT ? (
                <button
                  type="button"
                  id={moreBtnId}
                  onClick={() => setShowAll(false)}
                  aria-controls={itemsListId}
                  aria-expanded={true}
                  aria-label="Réduire la liste des éléments"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Réduire
                </button>
              ) : <span />}
              {onNavigateToTab && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={seeAllLink}
                  aria-label={
                    items.some((i) => i.kind === 'maintenance-overdue' || i.kind === 'maintenance-soon')
                      ? 'Voir toutes les maintenances dans l\'onglet Maintenance'
                      : 'Voir tous les points dans l\'onglet Points'
                  }
                >
                  Voir toutes les actions <span aria-hidden="true">→</span>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>

      <MaintenanceTaskDetailDialog isOpen={!!openTask} onClose={() => setOpenTask(null)} task={openTask} />
      <PointDetailDialog point={openPoint} open={!!openPoint} onOpenChange={(o) => { if (!o) setOpenPoint(null); }} />
    </Card>
  );
};

export default PriorityActionCard;