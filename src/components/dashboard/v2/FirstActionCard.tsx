import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench, Eye, ClipboardList, Sparkles, Star, AlertCircle, FolderOpen, CheckCircle2 } from 'lucide-react';
import type { FirstAction } from '@/hooks/dashboard/v2/useFirstAction';
import { cn } from '@/lib/utils';
import { FirstActionDetailDialog } from './FirstActionDetailDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

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

  const openDetails = () => setDetailOpen(true);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleConfirmDone = async () => {
    if (!action) return;
    setCompleting(true);
    try {
      if (action.source === 'planning') {
        const id = String(action.sourceId);
        // Check if recurring with occurrence date
        const { data: t } = await supabase
          .from('planning_tasks')
          .select('is_recurring, due_date')
          .eq('id', id)
          .maybeSingle();
        if (t?.is_recurring && user) {
          await supabase
            .from('planning_task_completions')
            .upsert(
              { task_id: id, completion_date: t.due_date, completed_by: user.id },
              { onConflict: 'task_id,completion_date' }
            );
          await supabase.from('planning_tasks').update({ status: 'todo' }).eq('id', id);
        } else {
          await supabase.from('planning_tasks').update({ status: 'done' }).eq('id', id);
        }
      } else if (action.source === 'maintenance') {
        await supabase
          .from('maintenance_tasks')
          .update({ status: 'completed', completed_date: new Date().toISOString() })
          .eq('id', Number(action.sourceId));
      } else if (action.source === 'point') {
        await supabase
          .from('points')
          .update({ status: 'resolved', resolved_at: new Date().toISOString() })
          .eq('id', String(action.sourceId));
      }
      toast.success('Marquée comme terminée');
      queryClient.invalidateQueries({ queryKey: ['dashboard-v2'] });
      queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
      queryClient.invalidateQueries({ queryKey: ['planningOverdue'] });
      queryClient.invalidateQueries({ queryKey: ['planningCompletions'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
      setConfirmOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Erreur');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <>
    <div
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
      className={cn(
        'relative rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-md overflow-hidden cursor-pointer transition-colors hover:bg-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isCritical && 'border-destructive/40 bg-destructive/[0.04] hover:bg-destructive/[0.07]'
      )}
    >
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
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{action.subtitle}</p>
          )}
        </div>
        <div className={cn(
          'h-16 w-16 sm:h-20 sm:w-20 rounded-xl flex items-center justify-center shrink-0',
          isCritical ? 'bg-destructive/10' : 'bg-primary/10'
        )}>
          <Icon className={cn('h-8 w-8', isCritical ? 'text-destructive' : 'text-primary')} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" onClick={stop}>
        <Button
          onClick={() => setConfirmOpen(true)}
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
          onClick={openDetails}
          size="sm"
          variant="ghost"
          className="text-primary whitespace-nowrap"
        >
          Voir la priorité <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
      <FirstActionDetailDialog action={action} open={detailOpen} onOpenChange={setDetailOpen} />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la complétion</AlertDialogTitle>
            <AlertDialogDescription>
              Marquer « {action.title} » comme terminée ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completing}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDone} disabled={completing}>
              {completing ? 'En cours...' : 'Oui, terminée'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
