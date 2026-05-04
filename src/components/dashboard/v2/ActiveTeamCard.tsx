import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Timer, ArrowRight, Play, Square } from 'lucide-react';
import type { ActiveTeamMember } from '@/hooks/dashboard/v2/useActiveTeam';
import { useAuth } from '@/hooks/useAuth';
import { useWorkShiftActions } from '@/hooks/work-shifts/useWorkShiftActions';

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

export const ActiveTeamCard: React.FC<Props> = ({ team, loading, limit = 5 }) => {
  const navigate = useNavigate();
  const { user } = useAuth(false);
  const { handlePunchIn, handlePunchOut, isPunchingIn, isPunchingOut, activeShift, isLoading: shiftLoading } =
    useWorkShiftActions();

  const myMember = user ? team.find((m) => m.userId === user.id) ?? null : null;
  const others = user ? team.filter((m) => m.userId !== user.id) : team;
  const visible = others.slice(0, limit);
  const overflow = Math.max(0, others.length - visible.length);

  const hasActiveShift = !!activeShift || !!myMember;
  const punchInDisabled = isPunchingIn || shiftLoading || hasActiveShift;
  const punchOutDisabled = isPunchingOut || (!activeShift && !myMember);

  const onPunchIn = () => {
    if (punchInDisabled) return;
    handlePunchIn();
  };
  const onPunchOut = () => {
    if (punchOutDisabled) return;
    handlePunchOut();
  };

  return (
    <div className="rounded-2xl border border-blue-200/60 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-900/40 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-200/60 dark:border-blue-900/40">
        <Users className="h-4 w-4 text-blue-700 dark:text-blue-300 shrink-0" />
        <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-50">Équipe active</h3>
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
          <Button size="sm" variant="default" disabled={punchInDisabled} onClick={onPunchIn}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Démarrer mon temps
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {myMember && (
            <li className="bg-blue-100/40 dark:bg-blue-900/20">
              <div className="flex items-center gap-3 px-4 py-2.5 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  {myMember.avatarUrl && <AvatarImage src={myMember.avatarUrl} alt={myMember.name} />}
                  <AvatarFallback className="text-xs">{initials(myMember.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-sm font-medium line-clamp-1">Ma session · {myMember.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {myMember.title || 'Session active'}
                    {myMember.equipmentName ? ` · ${myMember.equipmentName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0 whitespace-nowrap">
                  <Timer className="h-3.5 w-3.5" />
                  {formatDuration(myMember.startTime)}
                </div>
              </div>
            </li>
          )}
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
                  <p className="text-sm font-medium line-clamp-1">{m.name}</p>
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
      {!loading && team.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-blue-200/60 dark:border-blue-900/40 bg-white/70 dark:bg-background/40 min-w-0">
          {myMember ? (
            <>
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1 min-w-0 truncate">
                <Timer className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Ma session · {formatDuration(myMember.startTime)}</span>
              </span>
              <Button size="sm" variant="destructive" className="h-7 px-2.5 shrink-0" disabled={punchOutDisabled} onClick={onPunchOut}>
                <Square className="mr-1 h-3 w-3" />
                Terminer
              </Button>
            </>
          ) : (
            <Button size="sm" variant="default" className="h-7 px-2.5 ml-auto" disabled={punchInDisabled} onClick={onPunchIn}>
              <Play className="mr-1 h-3 w-3" />
              Démarrer mon temps
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
