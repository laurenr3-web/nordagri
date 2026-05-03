import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ClipboardList, Wrench, Box, Eye, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkTodayItem {
  id: string;
  title: string;
  category?: string | null;
  priority?: 'critical' | 'important' | 'todo' | null;
  assignedTo?: string | null;
}

interface Props {
  items: WorkTodayItem[];
  limit?: number;
  loading?: boolean;
}

const phase = (priority: WorkTodayItem['priority'], idx: number) => {
  if (priority === 'critical') return { icon: Wrench, tone: 'text-emerald-700 bg-emerald-100', badge: 'En cours', badgeTone: 'bg-emerald-100 text-emerald-700' };
  if (priority === 'important') return { icon: Box, tone: 'text-amber-700 bg-amber-100', badge: 'À faire', badgeTone: 'bg-amber-100 text-amber-700' };
  return { icon: Eye, tone: 'text-sky-700 bg-sky-100', badge: 'À revoir', badgeTone: 'bg-sky-100 text-sky-700' };
};

export const WorkTodayCard: React.FC<Props> = ({ items, limit = 3, loading }) => {
  const navigate = useNavigate();
  const visible = items.slice(0, limit);

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
          visible.map((item, idx) => {
            const ph = phase(item.priority, idx);
            const Icon = ph.icon;
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
                <span className={cn('text-[10px] font-medium px-2 py-1 rounded-md shrink-0 whitespace-nowrap', ph.badgeTone)}>
                  {ph.badge}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
