import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { ActiveTeamMember } from '@/hooks/dashboard/v2/useActiveTeam';
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  team: ActiveTeamMember[];
  loading?: boolean;
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

export const ActiveTeamCard: React.FC<Props> = ({ team, loading }) => {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Équipe active</h3>
        <span className="ml-auto text-xs text-muted-foreground">{team.length}</span>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">
          {[1,2].map(i => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : team.length === 0 ? (
        <p className="p-6 text-sm text-center text-muted-foreground">
          Aucun membre n'est en session active.
        </p>
      ) : (
        <ul className="divide-y">
          {team.slice(0, 6).map(m => (
            <li key={m.sessionId} className="flex items-center gap-3 px-4 py-2.5 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {m.equipmentName || m.title || 'En session'} · depuis{' '}
                  {formatDistanceToNowStrict(new Date(m.startTime), { locale: fr })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
