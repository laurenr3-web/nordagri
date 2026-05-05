import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Eye, History, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import MaintenanceTaskDetailDialog from '@/components/maintenance/dialogs/MaintenanceTaskDetailDialog';
import { PointDetailDialog } from '@/components/points/PointDetailDialog';
import { useEquipmentSnapshot } from './useEquipmentSnapshot';
import { Button } from '@/components/ui/button';

interface Props { equipment: EquipmentItem; onNavigateToTab?: (tab: string) => void; }

const OverviewRecent: React.FC<Props> = ({ equipment, onNavigateToTab }) => {
  const snap = useEquipmentSnapshot(equipment);
  const tasks = snap.tasks;
  const points = snap.points;
  const [openTask, setOpenTask] = useState<any>(null);
  const [openPoint, setOpenPoint] = useState<any>(null);

  const recentMaint = tasks
    .filter((t) => t.status !== 'cancelled')
    .sort((a, b) => new Date(b.dueDate || b.completedDate || 0).getTime() - new Date(a.dueDate || a.completedDate || 0).getTime())
    .slice(0, 3);

  const recentPoints = points.slice(0, 3);

  const history = [
    ...tasks.filter((t) => t.status === 'completed').map((t) => ({
      kind: 'maint' as const, icon: <Wrench className="h-3.5 w-3.5 text-amber-600" />,
      title: `Maintenance complétée : ${t.title}`,
      date: new Date(t.completedDate || t.dueDate),
    })),
    ...points.map((p) => ({
      kind: 'point' as const, icon: <Eye className="h-3.5 w-3.5 text-blue-600" />,
      title: `Point ${p.status === 'resolved' ? 'résolu' : 'ajouté'} : ${p.title}`,
      date: new Date(p.last_event_at || p.created_at),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);

  const fmtDay = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff <= 0) return `Aujourd'hui à ${format(d, 'HH:mm')}`;
    if (diff === 1) return `Hier à ${format(d, 'HH:mm')}`;
    return format(d, 'd MMM', { locale: fr });
  };

  const fmtDue = (t: any) => {
    if (!t.dueDate) return '';
    const d = new Date(t.dueDate);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    if (t.status === 'completed') return 'Terminée';
    if (diff < 0) return `Retard ${Math.abs(diff)} j`;
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    if (diff < 14) return `Dans ${diff} j`;
    return format(d, 'd MMM', { locale: fr });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm w-full min-w-0">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-1" />
              <CardTitle className="eq-title-card">Maintenances récentes</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateToTab?.('maintenance')} className="shrink-0 whitespace-nowrap h-7 px-2 text-xs text-primary">Voir tout</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {recentMaint.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Aucune maintenance récente.</p>
          ) : recentMaint.map((t) => (
            <button key={t.id} onClick={() => setOpenTask(t)} className="w-full text-left rounded-lg border border-border/40 p-2.5 hover:bg-accent/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{fmtDue(t)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm w-full min-w-0">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <Eye className="h-4 w-4 text-blue-600 shrink-0 mt-1" />
              <CardTitle className="eq-title-card">Points récents</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateToTab?.('points')} className="shrink-0 whitespace-nowrap h-7 px-2 text-xs text-primary">Voir tout</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {recentPoints.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Aucun point.</p>
          ) : recentPoints.map((p) => (
            <button key={p.id} onClick={() => setOpenPoint(p)} className="w-full text-left rounded-lg border border-border/40 p-2.5 hover:bg-accent/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 capitalize">{p.priority}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm w-full min-w-0">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <History className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              <CardTitle className="eq-title-card">Historique récent</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateToTab?.('history')} className="shrink-0 whitespace-nowrap h-7 px-2 text-xs text-primary">Voir tout</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Aucun événement récent.</p>
          ) : history.map((h, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg p-2 min-w-0">
              <div className="mt-0.5 shrink-0">{h.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug line-clamp-2">{h.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{fmtDay(h.date)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <MaintenanceTaskDetailDialog isOpen={!!openTask} onClose={() => setOpenTask(null)} task={openTask} />
      <PointDetailDialog point={openPoint} open={!!openPoint} onOpenChange={(o) => { if (!o) setOpenPoint(null); }} />
    </div>
  );
};

export default OverviewRecent;