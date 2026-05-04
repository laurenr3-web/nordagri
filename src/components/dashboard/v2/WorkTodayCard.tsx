import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, ClipboardList, Wrench, Eye, Plus, AlertTriangle, PlayCircle, Package, MapPin, Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useStartTaskFromDashboard } from '@/hooks/planning/useStartTaskFromDashboard';

export interface WorkTodayItem {
  id: string;
  title: string;
  category?: string | null;
  priority?: 'critical' | 'important' | 'todo' | null;
  assignedTo?: string | null;
  itemType?: 'task' | 'maintenance' | 'watch_point' | 'intervention' | 'part';
  status?: string | null;
  // Renseignés uniquement quand itemType === 'task'
  farmId?: string;
  equipmentId?: number | null;
  dueDate?: string;
}

interface Props {
  items: WorkTodayItem[];
  limit?: number;
  loading?: boolean;
}

const phase = (item: WorkTodayItem) => {
  const status = String(item.status ?? '').toLowerCase();
  const type = item.itemType ?? 'task';

  if (type === 'watch_point') {
    return { icon: Eye, tone: 'text-sky-700 bg-sky-100', badge: 'À revoir', badgeTone: 'bg-sky-100 text-sky-700' };
  }
  if (type === 'maintenance') {
    const overdue = status === 'overdue' || item.priority === 'critical';
    return {
      icon: Wrench,
      tone: overdue ? 'text-rose-700 bg-rose-100' : 'text-amber-700 bg-amber-100',
      badge: overdue ? 'En retard' : 'À faire',
      badgeTone: overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700',
    };
  }
  if (type === 'intervention') {
    return { icon: MapPin, tone: 'text-indigo-700 bg-indigo-100', badge: 'À faire', badgeTone: 'bg-indigo-100 text-indigo-700' };
  }
  if (type === 'part') {
    return { icon: Package, tone: 'text-purple-700 bg-purple-100', badge: 'À commander', badgeTone: 'bg-purple-100 text-purple-700' };
  }

  // task (planning)
  if (status === 'blocked' || status === 'bloqué' || status === 'bloque') {
    return { icon: AlertTriangle, tone: 'text-rose-700 bg-rose-100', badge: 'Bloqué', badgeTone: 'bg-rose-100 text-rose-700' };
  }
  if (status === 'in_progress' || status === 'en cours') {
    return { icon: PlayCircle, tone: 'text-emerald-700 bg-emerald-100', badge: 'En cours', badgeTone: 'bg-emerald-100 text-emerald-700' };
  }
  if (item.priority === 'critical') {
    return { icon: AlertTriangle, tone: 'text-rose-700 bg-rose-100', badge: 'Urgent', badgeTone: 'bg-rose-100 text-rose-700' };
  }
  return { icon: ClipboardList, tone: 'text-amber-700 bg-amber-100', badge: 'À faire', badgeTone: 'bg-amber-100 text-amber-700' };
};

export const WorkTodayCard: React.FC<Props> = ({ items, limit = 3, loading }) => {
  const navigate = useNavigate();
  const visible = items.slice(0, limit);
  const tasks = useStartTaskFromDashboard();

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Travail du jour</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/planning')} className="h-7 px-2 text-xs">
          Voir toute la file <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
      <div className="divide-y divide-border/60">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune tâche prévue aujourd'hui.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigate('/planning');
                setTimeout(() => window.dispatchEvent(new CustomEvent('planning:open-add-task')), 250);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Ajouter une tâche
            </Button>
          </div>
        ) : (
          visible.map((item) => {
            const ph = phase(item);
            const Icon = ph.icon;
            const status = item.status == null ? null : String(item.status).toLowerCase();
            const startable =
              item.itemType === 'task' &&
              (status === null || status === 'todo' || status === 'pending' || status === 'paused');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate('/planning')}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/40 transition-colors text-left min-w-0"
              >
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', ph.tone)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.category && (
                    <p className="text-[11px] text-muted-foreground capitalize truncate">{item.category}</p>
                  )}
                </div>
                {startable ? (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-disabled={tasks.isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!tasks.isLoading) tasks.startTask(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!tasks.isLoading) tasks.startTask(item);
                      }
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 h-7 px-2 text-xs font-medium rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shrink-0 whitespace-nowrap cursor-pointer',
                      tasks.isLoading && 'opacity-50 pointer-events-none',
                    )}
                  >
                    <Play className="h-3 w-3" />
                    Commencer
                  </span>
                ) : (
                  <span className={cn('text-[10px] font-medium px-2 py-1 rounded-md shrink-0 whitespace-nowrap', ph.badgeTone)}>
                    {ph.badge}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
      <AlertDialog
        open={!!tasks.conflictItem}
        onOpenChange={(o) => { if (!o) tasks.cancelConflict(); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session déjà active</AlertDialogTitle>
            <AlertDialogDescription>
              Tu as déjà une session de temps en cours. Que veux-tu faire ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <Button
              variant="default"
              disabled={tasks.isLoading}
              onClick={() => tasks.confirmEndCurrentAndStart()}
            >
              Terminer l'actuelle et commencer
            </Button>
            <Button
              variant="outline"
              disabled={tasks.isLoading}
              onClick={() => tasks.confirmStartWithoutTime()}
            >
              Commencer sans démarrer le temps
            </Button>
            <Button
              variant="ghost"
              disabled={tasks.isLoading}
              onClick={() => tasks.cancelConflict()}
            >
              Annuler
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
