import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Wrench, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { CheckTodayData } from '@/hooks/dashboard/useCheckTodayData';

interface Props {
  data: (CheckTodayData & { maintenanceDueCount: number }) | null;
  loading: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const Row = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors text-left"
  >
    {icon}
    <span className="text-sm text-foreground flex-1 truncate">{label}</span>
    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
  </button>
);

export const CheckTodayWidget = ({ data, loading }: Props) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!data) return null;

  const {
    forgottenPointsCount,
    forgottenPointsMaxDays,
    overdueTasksCount,
    maintenanceDueCount,
    dueChecksCount,
  } = data;
  const total =
    forgottenPointsCount + overdueTasksCount + maintenanceDueCount + (dueChecksCount ?? 0);

  if (total === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Tout est à jour ✓</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {dueChecksCount > 0 && (
        <Row
          icon={<Clock className="h-4 w-4 text-destructive shrink-0" />}
          label={`${dueChecksCount} point${dueChecksCount > 1 ? 's' : ''} à vérifier aujourd'hui`}
          onClick={() => navigate('/points')}
        />
      )}
      {forgottenPointsCount > 0 && (
        <Row
          icon={<AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
          label={
            forgottenPointsCount === 1
              ? `1 point oublié depuis ${forgottenPointsMaxDays} jour${forgottenPointsMaxDays > 1 ? 's' : ''}`
              : `${forgottenPointsCount} points oubliés depuis ${forgottenPointsMaxDays} jour${forgottenPointsMaxDays > 1 ? 's' : ''}`
          }
          onClick={() => navigate('/points')}
        />
      )}
      {overdueTasksCount > 0 && (
        <Row
          icon={<Clock className="h-4 w-4 text-destructive shrink-0" />}
          label={`${overdueTasksCount} tâche${overdueTasksCount > 1 ? 's' : ''} en retard`}
          onClick={() => navigate('/planning')}
        />
      )}
      {maintenanceDueCount > 0 && (
        <Row
          icon={<Wrench className="h-4 w-4 text-[hsl(30_90%_45%)] shrink-0" />}
          label={`${maintenanceDueCount} maintenance${maintenanceDueCount > 1 ? 's' : ''} due${maintenanceDueCount > 1 ? 's' : ''}`}
          onClick={() => navigate('/planning')}
        />
      )}
    </div>
  );
};