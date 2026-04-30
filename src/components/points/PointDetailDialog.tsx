import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, ListPlus, ChevronRight, CheckCircle2, X, Clock, FileText } from 'lucide-react';
import { Point, PointStatus } from '@/types/Point';
import { STATUS_LABELS, TYPE_EMOJI, TYPE_LABELS, daysOpen, nextCheckState } from './pointHelpers';
import { PointStatusBadge } from './StatusBadge';
import { PointPriorityBadge } from './PriorityBadge';
import { PointTimeline } from './PointTimeline';
import { AddEventDialog } from './AddEventDialog';
import { CreateLinkedTaskDialog } from './CreateLinkedTaskDialog';
import {
  useDeletePoint,
  useUpdatePointStatus,
  useUpdatePointNextCheck,
} from '@/hooks/points/usePointMutations';
import { usePointLinkedTasks } from '@/hooks/points/usePointLinkedTasks';
import { withPreviewToken } from '@/utils/previewRouting';
import { cn } from '@/lib/utils';
import { HelpTooltip } from '@/components/help/HelpTooltip';

const STATUSES: PointStatus[] = ['open', 'watch', 'resolved'];

interface Props {
  point: Point | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PointDetailDialog: React.FC<Props> = ({ point, open, onOpenChange }) => {
  const navigate = useNavigate();
  const updateStatus = useUpdatePointStatus();
  const deletePoint = useDeletePoint();
  const updateNextCheck = useUpdatePointNextCheck();
  const [addOpen, setAddOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const { data: linkedTasks } = usePointLinkedTasks(point?.id ?? null);

  if (!point) return null;

  const nc = nextCheckState(point.next_check_at);

  const handleStatus = async (s: PointStatus) => {
    await updateStatus.mutateAsync({ id: point.id, status: s });
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce point et tous ses événements ?')) return;
    await deletePoint.mutateAsync(point.id);
    onOpenChange(false);
  };

  const handleResolveAndClose = async () => {
    await updateStatus.mutateAsync({ id: point.id, status: 'resolved' });
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{TYPE_EMOJI[point.type]}</span>
              <div className="flex-1 min-w-0 pr-10">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {TYPE_LABELS[point.type]}
                </p>
                <SheetTitle className="text-base leading-tight">
                  {point.entity_label || 'Sans cible'}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <PointPriorityBadge priority={point.priority} />
                  <PointStatusBadge status={point.status} />
                  <HelpTooltip contentKey="surveillance.status" />
                  <span className="text-[11px] text-muted-foreground">
                    Ouvert depuis {daysOpen(point.created_at)} j
                  </span>
                </div>
                {point.status !== 'resolved' && nc.kind !== 'none' && (
                  <div
                    className={cn(
                      'mt-2 inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded border',
                      nc.badgeClass
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{nc.label}</span>
                    <HelpTooltip contentKey="surveillance.nextCheck" size={14} />
                    <button
                      type="button"
                      onClick={() => updateNextCheck.mutate({ id: point.id, days: null })}
                      className="ml-1 opacity-70 hover:opacity-100"
                      aria-label="Retirer la prochaine vérification"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Fermer"
                className="absolute right-2 top-2 h-9 w-9 z-20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2 mt-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    Changer statut
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded text-sm hover:bg-accent transition',
                        point.status === s && 'bg-accent font-medium'
                      )}
                    >
                      <span>{STATUS_LABELS[s]}</span>
                      {point.status === s && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={() => setTaskOpen(true)}>
                <ListPlus className="h-4 w-4 mr-1" /> Tâche
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-4">
            {/* Linked tasks */}
            {linkedTasks && linkedTasks.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold mb-2">Tâches liées</h3>
                <ul className="space-y-1.5">
                  {linkedTasks.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => navigate(withPreviewToken('/planning'))}
                        className="w-full flex items-center gap-2 p-2 rounded-lg border hover:bg-accent text-left"
                      >
                        <span
                          className={cn(
                            'inline-block w-2 h-2 rounded-full flex-shrink-0',
                            t.status === 'done' ? 'bg-emerald-500' : 'bg-blue-500'
                          )}
                        />
                        <span className="flex-1 text-sm truncate">{t.title}</span>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(t.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Timeline */}
            <section>
              <h3 className="text-sm font-semibold mb-2">Timeline</h3>
              {/* Description initiale du point, affichée comme première entrée
                  de la timeline (équivalente à l'observation d'origine). */}
              {point.title && (
                <div className="mb-3 rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Description</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      {new Date(point.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{point.title}</p>
                </div>
              )}
              <PointTimeline pointId={point.id} />
            </section>

            <button
              onClick={handleDelete}
              className="text-xs text-destructive flex items-center gap-1 hover:underline"
            >
              <Trash2 className="h-3 w-3" /> Supprimer ce point
            </button>
          </div>

          {/* Footer actions */}
          <div className="border-t bg-background p-3 flex gap-2 sticky bottom-0">
            <Button
              onClick={() => setAddOpen(true)}
              variant="outline"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
            {point.status !== 'resolved' && (
              <Button
                onClick={handleResolveAndClose}
                disabled={updateStatus.isPending}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" /> Terminer
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AddEventDialog open={addOpen} onOpenChange={setAddOpen} pointId={point.id} farmId={point.farm_id} />
      <CreateLinkedTaskDialog open={taskOpen} onOpenChange={setTaskOpen} point={point} />
    </>
  );
};