import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PointWatchItem } from '@/hooks/dashboard/usePointsWatchData';

interface Props {
  items: PointWatchItem[];
  criticalCount: number;
  importantCount: number;
  loading?: boolean;
}

export const DesktopWatchPoints: React.FC<Props> = ({ items, criticalCount, importantCount, loading }) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Points à surveiller</h3>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">{criticalCount} critiques</Badge>
          )}
          {importantCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">{importantCount} importants</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => navigate('/points')}>
          Voir <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">{[1,2].map(i => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="p-6 text-sm text-center text-muted-foreground">Rien à surveiller pour le moment.</p>
      ) : (
        <ul className="divide-y">
          {items.slice(0, 5).map(p => (
            <li key={p.id} className="px-4 py-2.5 flex items-center gap-3 min-w-0">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                p.priority === 'critical' ? 'bg-destructive' :
                p.priority === 'important' ? 'bg-amber-500' : 'bg-muted-foreground/40'
              }`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.title}</p>
                {p.entity_label && <p className="text-[11px] text-muted-foreground truncate">{p.entity_label}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
