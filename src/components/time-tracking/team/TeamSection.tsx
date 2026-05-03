import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, Users, ClipboardList } from 'lucide-react';
import { useFarmId } from '@/hooks/useFarmId';
import { useFarmTeamStatus, type FarmTeamMemberStatus } from '@/hooks/time-tracking/useFarmTeamStatus';

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

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diffMs < day) return "aujourd'hui";
  if (diffMs < 2 * day) return 'hier';
  const days = Math.floor(diffMs / day);
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString();
}

const MemberCard: React.FC<{ m: FarmTeamMemberStatus; onClick: () => void }> = ({ m, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors text-left min-w-0"
  >
    <Avatar className="h-10 w-10 shrink-0">
      {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
      <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
    </Avatar>
    <div className="min-w-0 flex-1 overflow-hidden">
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-sm font-medium truncate">{m.name}</p>
        {m.isActive ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 h-4 shrink-0">
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">Inactif</Badge>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground truncate">
        {m.isActive
          ? `${m.currentTitle ?? 'Session active'}${m.currentEquipment ? ` · ${m.currentEquipment}` : ''}`
          : `Dernière activité ${formatRelative(m.lastActivity)}`}
      </p>
      {m.todayTaskCount > 0 && (
        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
          <ClipboardList className="h-3 w-3" />
          {m.todayTaskCount} tâche{m.todayTaskCount > 1 ? 's' : ''} aujourd'hui
        </p>
      )}
    </div>
    {m.isActive && m.shiftStart && (
      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0 whitespace-nowrap">
        <Timer className="h-3.5 w-3.5" />
        {formatDuration(m.shiftStart)}
      </div>
    )}
  </button>
);

export const TeamSection: React.FC = () => {
  const { farmId } = useFarmId();
  const navigate = useNavigate();
  const { data: members, isLoading } = useFarmTeamStatus(farmId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Aucun membre dans la ferme.</p>
      </div>
    );
  }

  const active = members.filter(m => m.isActive);
  const inactive = members.filter(m => !m.isActive);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-semibold">Actifs</h3>
          <span className="text-xs text-muted-foreground">{active.length}</span>
        </div>
        {active.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">Aucun membre en session active.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {active.map(m => (
              <MemberCard key={m.userId} m={m} onClick={() => navigate('/planning')} />
            ))}
          </div>
        )}
      </div>
      {inactive.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-sm font-semibold">Inactifs</h3>
            <span className="text-xs text-muted-foreground">{inactive.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {inactive.map(m => (
              <MemberCard key={m.userId} m={m} onClick={() => navigate('/planning')} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
