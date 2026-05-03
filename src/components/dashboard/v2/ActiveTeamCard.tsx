import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Timer, ArrowRight, Play } from 'lucide-react';
import type { ActiveTeamMember } from '@/hooks/dashboard/v2/useActiveTeam';

interface Props {
  team: ActiveTeamMember[];
  loading?: boolean;
  unassignedCount?: number;
  limit?: number;
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

function formatDuration(start: string): string {
  const ms = Date.now() - new Date(start).getTime();
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export const ActiveTeamCard: React.FC<Props> = ({ team, loading, unassignedCount = 0, limit = 5 }) => {
  const navigate = useNavigate();
  const visible = team.slice(0, limit);
  const overflow = Math.max(0, team.length - visible.length);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Équipe active</h3>
        <button
          type="button"
          onClick={() => navigate('/time-tracking')}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          Voir équipe <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="p-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Aucune session active</p>
          <Button size="sm" variant="outline" onClick={() => navigate('/time-tracking')}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Démarrer suivi du temps
          </Button>
        </div>
      ) : (
        <ul className="divide-y">
          {visible.map((m) => (
            <li key={m.sessionId}>
              <button
                type="button"
                onClick={() => navigate('/time-tracking')}
                className="w-full flex items-center gap-3 px-4 py-2.5 min-w-0 hover:bg-accent/40 transition-colors text-left"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                  <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {m.title || 'Session active'}{m.equipmentName ? ` · ${m.equipmentName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0 whitespace-nowrap">
                  <Timer className="h-3.5 w-3.5" />
                  {formatDuration(m.startTime)}
                </div>
              </button>
            </li>
          ))}
          {overflow > 0 && (
            <li>
              <button
                type="button"
                onClick={() => navigate('/time-tracking')}
                className="w-full px-4 py-2 text-xs text-muted-foreground hover:bg-accent/40 text-left"
              >
                + {overflow} autre{overflow > 1 ? 's' : ''} actif{overflow > 1 ? 's' : ''}
              </button>
            </li>
          )}
        </ul>
      )}
      {unassignedCount > 0 && (
        <button
          type="button"
          onClick={() => navigate('/planning')}
          className="w-full flex items-center gap-2 px-4 py-2.5 border-t bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        >
          <Users className="h-4 w-4 text-amber-600" />
          <span className="text-xs flex-1 truncate min-w-0">
            {unassignedCount} tâche{unassignedCount > 1 ? 's' : ''} non assignée{unassignedCount > 1 ? 's' : ''}
          </span>
          <span className="text-xs font-medium text-primary inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
            Assigner <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      )}
    </div>
  );
};
