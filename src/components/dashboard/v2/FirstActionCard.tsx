import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench, Eye, ClipboardList, Sparkles, Star, AlertCircle, FolderOpen, CheckCircle2 } from 'lucide-react';
import type { FirstAction } from '@/hooks/dashboard/v2/useFirstAction';
import { cn } from '@/lib/utils';

const sourceIcon = {
  maintenance: Wrench,
  point: Eye,
  planning: ClipboardList,
} as const;

interface Props {
  action: FirstAction | null;
  loading?: boolean;
}

export const FirstActionCard: React.FC<Props> = ({ action, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-44 rounded-2xl border bg-card animate-pulse" />;
  }

  if (!action) {
    return (
      <div className="rounded-2xl border bg-card p-5 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">Tout est sous contrôle</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aucune action prioritaire pour aujourd'hui.
          </p>
        </div>
      </div>
    );
  }

  const Icon = sourceIcon[action.source];
  const isCritical = action.priority === 'critical';

  return (
    <div className={cn(
      'relative rounded-2xl border bg-card p-4 sm:p-5 shadow-sm overflow-hidden',
      isCritical && 'border-destructive/30'
    )}>
      {isCritical && (
        <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow">
          <AlertCircle className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          <Star className="h-3 w-3 fill-primary" /> À faire en premier
        </span>
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <div className="min-w-0 flex-1 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-foreground line-clamp-2 leading-tight break-words">
            {action.title}
          </h2>
          {action.subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-1">{action.subtitle}</p>
          )}
        </div>
        <div className={cn(
          'h-16 w-16 sm:h-20 sm:w-20 rounded-xl flex items-center justify-center shrink-0',
          isCritical ? 'bg-destructive/10' : 'bg-primary/10'
        )}>
          <Icon className={cn('h-8 w-8', isCritical ? 'text-destructive' : 'text-primary')} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          onClick={() => navigate(action.ctaPath)}
          size="sm"
          className="gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          Marquer fait
        </Button>
        {action.source === 'maintenance' && action.equipmentId && (
          <Button
            onClick={() => navigate(`/equipment/${action.equipmentId}`)}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            <FolderOpen className="h-4 w-4" />
            Ouvrir fiche
          </Button>
        )}
        <Button
          onClick={() => navigate(action.ctaPath)}
          size="sm"
          variant="ghost"
          className="text-primary whitespace-nowrap"
        >
          Voir la priorité <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
