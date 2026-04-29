import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showDetails, setShowDetails] = useState(false);

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
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Tâches assignées à un membre inconnu
            </h4>
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
              Réassigne-les ou retire l'assignation depuis le module Planification.
            </p>
          </div>
        )}
      </CardContent>
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