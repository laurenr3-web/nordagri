import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, Wrench, Eye, ClipboardList, Sparkles } from 'lucide-react';
import type { FirstAction } from '@/hooks/dashboard/v2/useFirstAction';
import { cn } from '@/lib/utils';

const sourceIcon = {
  maintenance: Wrench,
  point: Eye,
  planning: ClipboardList,
} as const;

const priorityClass = {
  critical: 'border-destructive/50 bg-destructive/5',
  important: 'border-amber-500/40 bg-amber-500/5',
  normal: 'border-primary/30 bg-primary/5',
} as const;

const priorityLabel = {
  critical: 'Critique',
  important: 'Important',
  normal: 'À faire',
} as const;

interface Props {
  action: FirstAction | null;
  loading?: boolean;
}

export const FirstActionCard: React.FC<Props> = ({ action, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-32 rounded-xl border bg-card animate-pulse" />;
  }

  if (!action) {
    return (
      <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
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

  const Icon = action.priority === 'critical' ? AlertTriangle : sourceIcon[action.source];

  return (
    <div className={cn('rounded-xl border-2 p-4 sm:p-5 shadow-sm', priorityClass[action.priority])}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
          action.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
          action.priority === 'important' ? 'bg-amber-500/10 text-amber-600' :
          'bg-primary/10 text-primary'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              À faire en premier
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {priorityLabel[action.priority]}
            </Badge>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">
            {action.title}
          </h2>
          {action.subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">{action.subtitle}</p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <Button
          onClick={() => navigate(action.ctaPath)}
          className="w-full sm:w-auto"
          size="lg"
        >
          {action.ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
