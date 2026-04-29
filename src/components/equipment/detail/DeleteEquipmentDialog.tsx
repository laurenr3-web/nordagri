import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeleteEquipmentDialogProps {
  equipmentId: number | string;
  equipmentName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

interface RelatedCounts {
  maintenanceTasks: number;
  schedule: number;
  photos: number;
  logs: number;
  qrCodes: number;
  interventions: number;
  planningTasks: number;
}

const DeleteEquipmentDialog: React.FC<DeleteEquipmentDialogProps> = ({
  equipmentId,
  equipmentName,
  isDeleting,
  onConfirm,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<RelatedCounts | null>(null);

  const numericId = typeof equipmentId === 'string' ? parseInt(equipmentId, 10) : equipmentId;

  useEffect(() => {
    if (!open || counts) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const tables: Array<[keyof RelatedCounts, string]> = [
          ['maintenanceTasks', 'maintenance_tasks'],
          ['schedule', 'equipment_maintenance_schedule'],
          ['photos', 'equipment_photos'],
          ['logs', 'equipment_logs'],
          ['qrCodes', 'equipment_qrcodes'],
          ['interventions', 'interventions'],
          ['planningTasks', 'planning_tasks'],
        ];
        const results = await Promise.all(
          tables.map(([, table]) =>
            supabase
              .from(table as any)
              .select('*', { count: 'exact', head: true })
              .eq('equipment_id', numericId)
          )
        );
        if (cancelled) return;
        const next: RelatedCounts = {
          maintenanceTasks: 0,
          schedule: 0,
          photos: 0,
          logs: 0,
          qrCodes: 0,
          interventions: 0,
          planningTasks: 0,
        };
        tables.forEach(([key], i) => {
          next[key] = results[i].count ?? 0;
        });
        setCounts(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, numericId, counts]);

  const totalMaintenance = (counts?.maintenanceTasks ?? 0) + (counts?.schedule ?? 0);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Suppression...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Supprimer
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Supprimer "{equipmentName}" ?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p>Cette action est définitive. Voici ce qui va se passer :</p>

              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1.5">
                <div className="font-medium text-destructive flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Sera supprimé
                </div>
                {loading ? (
                  <p className="text-muted-foreground italic">Analyse en cours...</p>
                ) : counts ? (
                  <ul className="text-foreground/90 space-y-0.5 ml-5 list-disc">
                    <li>L'équipement lui-même</li>
                    <li>
                      <strong>{totalMaintenance}</strong> tâche{totalMaintenance > 1 ? 's' : ''} de maintenance
                    </li>
                    <li>
                      <strong>{counts.photos}</strong> photo{counts.photos > 1 ? 's' : ''}
                    </li>
                    <li>
                      <strong>{counts.logs}</strong> entrée{counts.logs > 1 ? 's' : ''} de journal d'usure
                    </li>
                    <li>
                      <strong>{counts.interventions}</strong> intervention{counts.interventions > 1 ? 's' : ''}
                    </li>
                    <li>
                      <strong>{counts.qrCodes}</strong> code{counts.qrCodes > 1 ? 's' : ''} QR
                    </li>
                  </ul>
                ) : null}
              </div>

              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1.5">
                <div className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sera conservé
                </div>
                <ul className="text-foreground/90 space-y-0.5 ml-5 list-disc">
                  <li>Toutes les <strong>pièces du stock</strong> (parts_inventory)</li>
                  <li>L'historique des sorties de pièces</li>
                  {counts && counts.planningTasks > 0 && (
                    <li>
                      <strong>{counts.planningTasks}</strong> tâche{counts.planningTasks > 1 ? 's' : ''} de Planification (simplement détachée{counts.planningTasks > 1 ? 's' : ''})
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting || loading}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEquipmentDialog;