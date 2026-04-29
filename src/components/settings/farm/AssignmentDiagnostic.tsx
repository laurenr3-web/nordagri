import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  User,
  Loader2,
  Wand2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const UNASSIGN_VALUE = '__unassign__';

interface MemberRow {
  memberId: string;
  userId: string;
  role: string;
  name: string;
  profileOk: boolean;
  taskCount: number;
  isOwner: boolean;
}

interface OrphanTask {
  id: string;
  title: string;
  assigned_to: string;
  due_date: string;
  status: string;
}

/**
 * Diagnostic d'intégrité des assignations de tâches.
 *
 * Vérifie que pour chaque tâche `planning_tasks.assigned_to` :
 *  - la valeur correspond bien à un `farm_members.id` valide,
 *  - ce farm_member appartient à la ferme actuelle,
 *  - et son `user_id` est cohérent (existe dans profiles).
 *
 * Affiche aussi le mapping membre ↔ user pour confirmation visuelle.
 */
export function AssignmentDiagnostic() {
  const { farmId } = useFarmId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDetails, setShowDetails] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  // Map taskId -> selected farm_members.id OR UNASSIGN_VALUE
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['assignment-diagnostic', farmId],
    queryFn: async () => {
      if (!farmId) return null;

      // Membres de la ferme
      const { data: farm } = await supabase
        .from('farms')
        .select('owner_id, name')
        .eq('id', farmId)
        .single();

      const { data: members } = await supabase
        .from('farm_members')
        .select('id, user_id, role, farm_id')
        .eq('farm_id', farmId);

      const memberIds = new Set<string>((members || []).map((m) => m.id));
      const userIds = new Set<string>();
      (members || []).forEach((m) => userIds.add(m.user_id));
      if (farm?.owner_id) userIds.add(farm.owner_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', Array.from(userIds));

      const profileById = new Map<string, { first_name: string | null; last_name: string | null }>();
      (profiles || []).forEach((p) => profileById.set(p.id, p));

      // Tâches avec assignation
      const { data: tasks } = await supabase
        .from('planning_tasks')
        .select('id, title, assigned_to, due_date, status, farm_id')
        .eq('farm_id', farmId)
        .not('assigned_to', 'is', null);

      // Catégorisation
      const orphanTasks: { id: string; title: string; assigned_to: string; due_date: string; status: string }[] = [];
      const validTasks: typeof orphanTasks = [];
      for (const t of tasks || []) {
        if (!t.assigned_to) continue;
        if (memberIds.has(t.assigned_to)) {
          validTasks.push(t as any);
        } else {
          orphanTasks.push(t as any);
        }
      }

      // Membres détaillés (avec nom + profil ok)
      const memberRows = (members || []).map((m) => {
        const p = profileById.get(m.user_id);
        const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || '— sans nom —';
        const taskCount = (tasks || []).filter((t) => t.assigned_to === m.id).length;
        return {
          memberId: m.id,
          userId: m.user_id,
          role: m.role || 'member',
          name,
          profileOk: !!p,
          taskCount,
          isOwner: m.user_id === farm?.owner_id,
        };
      });

      return {
        farmName: farm?.name || 'Ferme',
        ownerId: farm?.owner_id || null,
        memberRows,
        totalTasks: tasks?.length || 0,
        validCount: validTasks.length,
        orphanCount: orphanTasks.length,
        orphanTasks,
        missingProfileMembers: memberRows.filter((m) => !m.profileOk),
      };
    },
    enabled: !!farmId,
  });

  // Suggested default: the owner's farm_member.id if it exists, otherwise the first member with a profile,
  // otherwise unassign.
  const suggestedMemberId: string = useMemo(() => {
    if (!data) return UNASSIGN_VALUE;
    const ownerMember = data.memberRows.find((m) => m.isOwner && m.profileOk);
    if (ownerMember) return ownerMember.memberId;
    const firstOk = data.memberRows.find((m) => m.profileOk);
    if (firstOk) return firstOk.memberId;
    return UNASSIGN_VALUE;
  }, [data]);

  // Pre-fill decisions whenever the dialog opens or data changes
  useEffect(() => {
    if (!reassignOpen || !data) return;
    setDecisions((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const t of data.orphanTasks) {
        if (!next[t.id]) next[t.id] = suggestedMemberId;
      }
      // Drop entries for tasks that no longer exist
      const orphanIds = new Set(data.orphanTasks.map((t) => t.id));
      Object.keys(next).forEach((k) => {
        if (!orphanIds.has(k)) delete next[k];
      });
      return next;
    });
  }, [reassignOpen, data, suggestedMemberId]);

  const handleApply = async () => {
    if (!data) return;
    setApplying(true);
    let success = 0;
    let failed = 0;
    try {
      for (const t of data.orphanTasks) {
        const choice = decisions[t.id] ?? suggestedMemberId;
        const newAssignee = choice === UNASSIGN_VALUE ? null : choice;
        const { error } = await supabase
          .from('planning_tasks')
          .update({ assigned_to: newAssignee })
          .eq('id', t.id);
        if (error) {
          console.error('Reassignment failed for task', t.id, error);
          failed++;
        } else {
          success++;
        }
      }
      if (success > 0) {
        toast({
          title: 'Réassignation effectuée',
          description: `${success} tâche${success > 1 ? 's' : ''} mise${success > 1 ? 's' : ''} à jour${
            failed > 0 ? `, ${failed} échec(s)` : ''
          }.`,
        });
      }
      if (failed > 0 && success === 0) {
        toast({
          title: 'Échec de la réassignation',
          description: `Impossible de mettre à jour ${failed} tâche${failed > 1 ? 's' : ''}.`,
          variant: 'destructive',
        });
      }
      // Refresh diagnostic + planning views
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['planningTasks'] }),
        queryClient.invalidateQueries({ queryKey: ['planning-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['assigned-open-planning-tasks'] }),
      ]);
      setReassignOpen(false);
    } finally {
      setApplying(false);
    }
  };

  const memberById = useMemo(() => {
    const m = new Map<string, MemberRow>();
    (data?.memberRows || []).forEach((row) => m.set(row.memberId, row));
    return m;
  }, [data]);

  if (!farmId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic des assignations</CardTitle>
          <CardDescription>Aucune ferme active.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Diagnostic des assignations
          </CardTitle>
          <CardDescription>Analyse en cours…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement des données
          </div>
        </CardContent>
      </Card>
    );
  }

  const allClean = data.orphanCount === 0 && data.missingProfileMembers.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Diagnostic des assignations
            </CardTitle>
            <CardDescription>
              Vérifie que les tâches assignées pointent bien vers des membres valides de la ferme.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            Re-vérifier
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Résumé global */}
        {allClean ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Tout est cohérent</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              {data.totalTasks} tâche{data.totalTasks > 1 ? 's' : ''} assignée{data.totalTasks > 1 ? 's' : ''} —
              chaque <code className="text-xs">assigned_to</code> correspond à un membre valide.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">Incohérences détectées</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 space-y-1 mt-1">
              {data.orphanCount > 0 && (
                <div>
                  • {data.orphanCount} tâche{data.orphanCount > 1 ? 's' : ''} pointe
                  {data.orphanCount > 1 ? 'nt' : ''} vers un membre qui n'existe plus.
                </div>
              )}
              {data.missingProfileMembers.length > 0 && (
                <div>
                  • {data.missingProfileMembers.length} membre{data.missingProfileMembers.length > 1 ? 's' : ''}
                  {' '}sans profil visible.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats compactes */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBox label="Membres" value={data.memberRows.length} />
          <StatBox label="Tâches assignées" value={data.totalTasks} />
          <StatBox
            label="Orphelines"
            value={data.orphanCount}
            tone={data.orphanCount > 0 ? 'warn' : 'default'}
          />
        </div>

        {/* Liste membres */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Mapping membre → utilisateur</h4>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails((s) => !s)} className="h-7 text-xs">
              {showDetails ? 'Masquer les IDs' : 'Afficher les IDs'}
            </Button>
          </div>
          <div className="border rounded-md divide-y">
            {data.memberRows.map((m) => (
              <div key={m.memberId} className="p-2.5 flex items-center justify-between gap-2 text-sm flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-1.5">
                      {m.name}
                      {m.userId === data.ownerId && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1">Propriétaire</Badge>
                      )}
                      <Badge variant="secondary" className="text-[9px] h-4 px-1 capitalize">{m.role}</Badge>
                    </div>
                    {showDetails && (
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5 space-y-0.5">
                        <div>member: {m.memberId}</div>
                        <div>user:&nbsp;&nbsp; {m.userId}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {m.profileOk ? (
                    <Badge variant="outline" className="text-[10px] gap-1 border-green-200 text-green-700 dark:text-green-400 dark:border-green-900/50">
                      <CheckCircle2 className="h-3 w-3" /> profil OK
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] gap-1 border-amber-200 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" /> profil manquant
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">
                    {m.taskCount} tâche{m.taskCount > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            ))}
            {data.memberRows.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground text-center">Aucun membre dans cette ferme.</div>
            )}
          </div>
        </div>

        {/* Tâches orphelines */}
        {data.orphanCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Tâches assignées à un membre inconnu
              </h4>
              <Button
                size="sm"
                onClick={() => setReassignOpen(true)}
                className="gap-1.5"
                disabled={data.memberRows.length === 0}
              >
                <Wand2 className="h-3.5 w-3.5" />
                Proposer une réassignation
              </Button>
            </div>
            <div className="border rounded-md divide-y">
              {data.orphanTasks.map((t) => (
                <div key={t.id} className="p-2.5 text-sm">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    assigned_to: {t.assigned_to} · due: {t.due_date} · status: {t.status}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Ces tâches ont été assignées à un membre qui a depuis quitté la ferme.
              Utilise « Proposer une réassignation » pour les corriger en lot.
            </p>
          </div>
        )}
      </CardContent>

      {/* Reassignment dialog */}
      <Dialog open={reassignOpen} onOpenChange={(o) => !applying && setReassignOpen(o)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Proposer une réassignation
            </DialogTitle>
            <DialogDescription>
              Choisis un nouveau membre pour chaque tâche orpheline ou retire l'assignation.
              Les choix sont appliqués uniquement après confirmation.
            </DialogDescription>
          </DialogHeader>

          {data && (
            <div className="space-y-3">
              {/* Bulk action helper */}
              <div className="flex items-center justify-between gap-2 flex-wrap p-2.5 rounded-md bg-muted/50 text-xs">
                <span className="text-muted-foreground">
                  Suggestion : {suggestedMemberId === UNASSIGN_VALUE
                    ? 'retirer l\'assignation'
                    : memberById.get(suggestedMemberId)?.name || 'membre'}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const next: Record<string, string> = {};
                      data.orphanTasks.forEach((t) => { next[t.id] = suggestedMemberId; });
                      setDecisions(next);
                    }}
                  >
                    Tout suggérer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const next: Record<string, string> = {};
                      data.orphanTasks.forEach((t) => { next[t.id] = UNASSIGN_VALUE; });
                      setDecisions(next);
                    }}
                  >
                    Tout retirer
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {data.orphanTasks.map((t) => {
                  const value = decisions[t.id] ?? suggestedMemberId;
                  return (
                    <div key={t.id} className="border rounded-md p-2.5 space-y-2">
                      <div className="text-sm font-medium leading-snug">{t.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        due: {t.due_date} · status: {t.status}
                      </div>
                      <Select
                        value={value}
                        onValueChange={(v) => setDecisions((d) => ({ ...d, [t.id]: v }))}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGN_VALUE}>
                            <span className="text-muted-foreground">— Retirer l'assignation —</span>
                          </SelectItem>
                          {data.memberRows.map((m) => (
                            <SelectItem key={m.memberId} value={m.memberId} disabled={!m.profileOk}>
                              {m.name}
                              {m.isOwner ? ' (propriétaire)' : ''}
                              {!m.profileOk ? ' — profil manquant' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}

                {data.orphanTasks.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-6">
                    Aucune tâche orpheline à réassigner.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setReassignOpen(false)}
              disabled={applying}
            >
              Annuler
            </Button>
            <Button
              onClick={handleApply}
              disabled={applying || !data || data.orphanTasks.length === 0}
              className="gap-1.5"
            >
              {applying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Appliquer ({data?.orphanTasks.length || 0})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StatBox({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'warn';
}) {
  return (
    <div
      className={cn(
        'rounded-md border p-2',
        tone === 'warn' && value > 0 && 'border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50'
      )}
    >
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}