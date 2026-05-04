import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { useFarmId } from '@/hooks/useFarmId';
import { useFarmTeamStatus } from '@/hooks/time-tracking/useFarmTeamStatus';
import { formatHMRange } from '@/utils/timeFormat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

interface ActiveTeamCardProps {
  maxMobile?: number;
  maxDesktop?: number;
  onSeeAll?: () => void;
}

export function ActiveTeamCard({ maxMobile = 3, maxDesktop = 6, onSeeAll }: ActiveTeamCardProps) {
  const { farmId } = useFarmId();
  const { data: members, isLoading } = useFarmTeamStatus(farmId);

  const active = (members ?? []).filter((m) => m.isActive && m.shiftStart);
  const totalMs = active.reduce((sum, m) => {
    const t = m.shiftStart ? Date.now() - new Date(m.shiftStart).getTime() : 0;
    return sum + Math.max(0, t);
  }, 0);

  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <div className="p-5 sm:p-6 flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Équipe active</h3>
          {onSeeAll && active.length > 0 && (
            <button
              onClick={onSeeAll}
              className="text-xs text-primary hover:underline shrink-0"
              type="button"
            >
              Voir tout
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center text-center py-6 gap-2">
            <div className="rounded-full bg-muted p-3">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Aucun membre en session active</p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {active.slice(0, maxDesktop).map((m, i) => {
                const hideOnMobile = i >= maxMobile;
                const startedAt = m.shiftStart
                  ? format(new Date(m.shiftStart), 'HH:mm', { locale: fr })
                  : '--:--';
                const work = m.currentTitle || 'Session active';
                const ctx = m.currentEquipment || '';
                return (
                  <li
                    key={m.userId}
                    className={`flex items-center gap-3 rounded-xl border bg-card p-3 min-w-0 ${
                      hideOnMobile ? 'hidden lg:flex' : ''
                    }`}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                      <AvatarFallback className="text-xs">{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p className="text-sm font-medium truncate">{m.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {work}
                        {ctx ? ` · ${ctx}` : ''}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Depuis {startedAt}</p>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-primary shrink-0 whitespace-nowrap">
                      {formatHMRange(m.shiftStart!)}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {active.length} membre{active.length > 1 ? 's' : ''} actif
                {active.length > 1 ? 's' : ''}
              </span>
              <span className="font-medium tabular-nums">
                {formatHMRange(new Date(Date.now() - totalMs).toISOString())} total
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}