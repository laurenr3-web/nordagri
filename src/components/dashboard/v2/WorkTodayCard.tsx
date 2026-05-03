import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ClipboardList } from 'lucide-react';
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

const prioColor: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive',
  important: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  todo: 'bg-muted text-muted-foreground',
};

export const WorkTodayCard: React.FC<Props> = ({ items, limit = 3, loading }) => {
  const navigate = useNavigate();
  const visible = items.slice(0, limit);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Travail du jour</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/planning')} className="h-7 px-2 text-xs">
          Tout voir <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
      <div className="divide-y">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-center text-muted-foreground">
            Aucune autre tâche pour aujourd'hui.
          </p>
        ) : (
          visible.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate('/planning')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left min-w-0"
            >
              <div className={cn(
                'h-2 w-2 rounded-full flex-shrink-0',
                item.priority === 'critical' ? 'bg-destructive' :
                item.priority === 'important' ? 'bg-amber-500' : 'bg-muted-foreground/40'
              )} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.category && (
                  <p className="text-[11px] text-muted-foreground capitalize truncate">{item.category}</p>
                )}
              </div>
              {item.priority && item.priority !== 'todo' && (
                <Badge className={cn('text-[10px] flex-shrink-0', prioColor[item.priority])} variant="outline">
                  {item.priority === 'critical' ? 'Critique' : 'Important'}
                </Badge>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
