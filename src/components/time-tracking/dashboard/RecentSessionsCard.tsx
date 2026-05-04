import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatHMRange } from '@/utils/timeFormat';
import { useNavigate } from 'react-router-dom';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

function describeWork(s: TimeEntry): string {
  const anyS = s as any;
  if (anyS.title) return anyS.title;
  if (s.task_type === 'other' && s.custom_task_type) return s.custom_task_type;
  const labels: Record<string, string> = {
    maintenance: 'Maintenance',
    repair: 'Réparation',
    inspection: 'Inspection',
    operation: 'Opération',
    other: 'Autre',
  };
  return labels[s.task_type] ?? 'Session';
}

function describeContext(s: TimeEntry): string | null {
  if (s.equipment_name) return s.equipment_name;
  if (s.poste_travail) return s.poste_travail;
  if (s.location) return s.location;
  return null;
}

interface RecentSessionsCardProps {
  entries: TimeEntry[];
  isLoading: boolean;
  maxMobile?: number;
  maxDesktop?: number;
  onSeeAll?: () => void;
}

export function RecentSessionsCard({
  entries,
  isLoading,
  maxMobile = 3,
  maxDesktop = 5,
  onSeeAll,
}: RecentSessionsCardProps) {
  const navigate = useNavigate();
  const sorted = [...entries].sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
  const visible = sorted.slice(0, maxDesktop);

  return (
    <Card className="rounded-2xl shadow-sm w-full h-full">
      <div className="p-5 sm:p-6 flex flex-col gap-4 h-full min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Sessions récentes</h3>
          {onSeeAll && entries.length > 0 && (
            <button
              onClick={onSeeAll}
              type="button"
              className="text-xs text-primary hover:underline shrink-0"
            >
              Voir tout
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8 gap-2">
            <div className="rounded-full bg-muted p-3">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Aucune session récente</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((s, i) => {
              const isActive = s.status === 'active' || !s.end_time;
              const name = s.user_name || s.owner_name || s.technician || 'Utilisateur';
              const work = describeWork(s);
              const ctx = describeContext(s);
              const startTime = format(new Date(s.start_time), 'HH:mm', { locale: fr });
              const endTime = s.end_time
                ? format(new Date(s.end_time), 'HH:mm', { locale: fr })
                : 'En cours';
              const duration = formatHMRange(s.start_time, s.end_time ?? undefined);
              const hideOnMobile = i >= maxMobile;
              return (
                <li
                  key={s.id}
                  onClick={() => navigate(`/time-tracking/detail/${s.id}`)}
                  className={`flex items-center gap-3 rounded-xl border bg-card p-3 cursor-pointer hover:bg-accent/40 transition-colors min-w-0 ${
                    hideOnMobile ? 'hidden lg:flex' : ''
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {work}
                      {ctx ? ` · ${ctx}` : ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {startTime} – {endTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                      {duration}
                    </span>
                    {isActive ? (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0 text-[10px] h-4 px-1.5">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        Terminée
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}