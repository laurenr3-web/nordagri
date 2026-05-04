
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Pause, Play, Square, Pencil, Tractor } from 'lucide-react';
import { ActiveTimeEntry } from '@/hooks/time-tracking/types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatHMRange } from '@/utils/timeFormat';

interface ActiveTimeSessionProps {
  session: ActiveTimeEntry;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
}

function describeWork(s: ActiveTimeEntry): string {
  if (s.title) return s.title;
  if (s.description) return s.description;
  if (s.task_type === 'other' && s.custom_task_type) return s.custom_task_type;
  if (s.task_type) {
    const labels: Record<string, string> = {
      maintenance: 'Maintenance',
      repair: 'Réparation',
      inspection: 'Inspection',
      operation: 'Opération',
      other: 'Autre',
    };
    return labels[s.task_type] ?? 'Session active';
  }
  return 'Session active';
}

function describeContext(s: ActiveTimeEntry): string | null {
  if (s.equipment_name) return s.equipment_name;
  if (s.poste_travail) return s.poste_travail;
  if (s.location) return s.location;
  return null;
}

export function ActiveTimeSession({
  session,
  onPause,
  onResume,
  onStop,
}: ActiveTimeSessionProps) {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const isPaused = session.status === 'paused';
  const duration = formatHMRange(session.start_time);
  const startedAt = session.start_time
    ? format(new Date(session.start_time), 'HH:mm', { locale: fr })
    : '--:--';
  const work = describeWork(session);
  const context = describeContext(session);

  const handleStop = () => navigate(`/time-tracking/detail/${session.id}`);
  const handleEdit = () => navigate(`/time-tracking/detail/${session.id}`);

  return (
    <Card
      data-tick={tick}
      className="relative overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm"
    >
      <div className="absolute inset-y-0 right-0 hidden lg:flex items-center pr-8 opacity-10 pointer-events-none">
        <Tractor className="h-40 w-40 text-primary" />
      </div>
      <div className="relative p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 min-w-0">
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border-0 shrink-0">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {isPaused ? 'En pause' : 'Session active'}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">Ma session active</span>
        </div>

        <div className="flex items-end gap-3 min-w-0">
          <div className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight text-foreground leading-none shrink-0">
            {duration}
          </div>
          <div className="text-sm text-muted-foreground pb-1 inline-flex items-center gap-1.5 shrink-0">
            <Clock className="h-3.5 w-3.5" />
            Depuis {startedAt}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-base sm:text-lg font-medium line-clamp-2">{work}</p>
          {context && (
            <p className="mt-1 text-sm text-muted-foreground truncate">{context}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={handleStop} size="lg" className="rounded-xl flex-1 sm:flex-none">
            <Square className="h-4 w-4" />
            Terminer la session
          </Button>
          {isPaused ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onResume(session.id)}
              className="rounded-xl"
            >
              <Play className="h-4 w-4" />
              Reprendre
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onPause(session.id)}
              className="rounded-xl"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={handleEdit} className="rounded-xl">
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface EmptyActiveSessionProps {
  onStart: () => void;
}

export function EmptyActiveSession({ onStart }: EmptyActiveSessionProps) {
  return (
    <Card className="rounded-2xl border-dashed bg-muted/20 shadow-none">
      <div className="p-6 sm:p-8 flex flex-col items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Aucune session active</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Démarre ton temps pour suivre le travail effectué.
          </p>
        </div>
        <Button onClick={onStart} size="lg" className="rounded-xl mt-1">
          Démarrer une session
        </Button>
      </div>
    </Card>
  );
}
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-2 w-full">
          {/* Utilisateur et durée */}
          <div className="flex items-center gap-3 w-full">
            <User className="h-10 w-10 text-blue-500 flex-shrink-0" />
            <div>
              <div className="text-sm text-blue-700">
                {session.user_name || session.owner_name || 'Non assigné'}
              </div>
              <div className="text-3xl font-mono font-bold text-blue-900">
                {session.current_duration || "00:00:00"}
              </div>
            </div>
          </div>
          
          {/* Tâche et location */}
          <div className="flex flex-col justify-center mt-2 md:mt-0 min-w-0">
            <div className="text-sm text-blue-700 truncate">
              {session.task_type === 'other' 
                ? session.custom_task_type 
                : session.task_type} {session.equipment_name ? `- ${session.equipment_name}` : ''}
            </div>
            <div className="text-sm text-blue-700 truncate">
              {session.location || 'Aucun emplacement'}
            </div>
          </div>
          
          {/* Boutons */}
          <div className="flex items-center justify-end gap-2 mt-2 md:mt-0 flex-wrap w-full sm:w-auto">
            <span className="mr-2 text-blue-700 min-w-max">
              {session.status === 'active' ? 'En cours' : 'En pause'}
            </span>
            {session.status === 'active' ? (
              <Button
                onClick={() => onPause(session.id)}
                className="bg-blue-600 hover:bg-blue-700 min-h-[44px] w-full sm:w-auto"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={() => onResume(session.id)}
                className="bg-green-600 hover:bg-green-700 min-h-[44px] w-full sm:w-auto"
              >
                Reprendre
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleStop}
              title="Aller à la page de clôture"
              className="min-h-[44px] w-full sm:w-auto"
            >
              Terminer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
