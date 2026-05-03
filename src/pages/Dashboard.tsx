import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/ui/layouts/MainLayout';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { useAuthContext } from '@/providers/AuthProvider';
import { useFarmId } from '@/hooks/useFarmId';
import { CreateFarmDialog } from '@/components/farm/CreateFarmDialog';
import { EmptyState } from '@/components/help/EmptyState';
import { emptyStates } from '@/content/help/emptyStates';

import { useFirstAction } from '@/hooks/dashboard/v2/useFirstAction';
import { useDashboardSignals } from '@/hooks/dashboard/v2/useDashboardSignals';
import { useActiveTeam } from '@/hooks/dashboard/v2/useActiveTeam';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { usePointsWatchData } from '@/hooks/dashboard/usePointsWatchData';
import { todayLocal } from '@/lib/dateLocal';
import { useIsMobile } from '@/hooks/use-mobile';

import { DashboardHeader } from '@/components/dashboard/v2/DashboardHeader';
import { DashboardContextBar } from '@/components/dashboard/v2/DashboardContextBar';
import { FirstActionCard } from '@/components/dashboard/v2/FirstActionCard';
import { WorkTodayCard, type WorkTodayItem } from '@/components/dashboard/v2/WorkTodayCard';
import { ActiveTeamCard } from '@/components/dashboard/v2/ActiveTeamCard';
import { DesktopWatchPoints } from '@/components/dashboard/v2/DesktopWatchPoints';
import { FleetStatusCard } from '@/components/dashboard/v2/FleetStatusCard';
import { BlockersCard } from '@/components/dashboard/v2/BlockersCard';
import { RecentActivityCard } from '@/components/dashboard/v2/RecentActivityCard';
import { WeekStatsCard } from '@/components/dashboard/v2/WeekStatsCard';

const Dashboard: React.FC = () => {
  const { user, profileData } = useAuthContext();
  const queryClient = useQueryClient();
  const { farmId, farmName } = useFarmId();
  const hasFarm = !!farmId;
  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const isMobile = useIsMobile();

  const todayStr = todayLocal();

  const firstAction = useFirstAction(farmId);
  const { data: signals } = useDashboardSignals(farmId);
  const { data: activeTeam = [], isLoading: teamLoading } = useActiveTeam(farmId);
  const {
    tasks: planningTasks = [],
    overdueTasks = [],
    isLoading: planningLoading,
  } = usePlanningTasks(farmId, todayStr, todayStr) as any;
  const { data: pointsWatch, isLoading: pointsLoading } = usePointsWatchData(farmId, hasFarm);

  const workItems = useMemo<WorkTodayItem[]>(() => {
    const inactiveStatuses = new Set([
      'done', 'completed', 'resolved', 'cancelled', 'canceled', 'terminé', 'termine', 'annulé', 'annule',
    ]);

    // Merge today's tasks + overdue (non-done) tasks
    const merged = [...(overdueTasks ?? []), ...(planningTasks ?? [])];

    // Dedupe by id
    const byId = new Map<string, any>();
    for (const t of merged) {
      if (!t || !t.id) continue;
      if (inactiveStatuses.has(String(t.status).toLowerCase())) continue;
      if (!byId.has(String(t.id))) byId.set(String(t.id), t);
    }

    // Inject "points à surveiller" with last_event today as virtual items
    const today = todayStr;
    const watchExamples = (pointsWatch?.examples ?? []) as any[];
    for (const p of watchExamples) {
      const eventDay = p.last_event_at ? String(p.last_event_at).slice(0, 10) : null;
      if (eventDay !== today) continue;
      const key = `point:${p.id}`;
      if (byId.has(key)) continue;
      byId.set(key, {
        id: key,
        title: p.title,
        category: p.entity_label ?? 'Point à surveiller',
        status: 'todo',
        manual_priority: p.priority === 'normal' ? 'todo' : p.priority,
        computed_priority: p.priority === 'normal' ? 'todo' : p.priority,
        due_date: today,
        assigned_to: null,
        _kind: 'point',
      });
    }

    // Order: en cours → bloquées → critiques → en retard → dues aujourd'hui
    //        → importantes non assignées → points à surveiller dus aujourd'hui → autres
    const score = (t: any): number => {
      const status = String(t.status ?? '').toLowerCase();
      const prio = (t.manual_priority ?? t.computed_priority) as string | null;
      const isPoint = t._kind === 'point';
      if (status === 'in_progress' || status === 'en cours') return 0;
      if (status === 'blocked' || status === 'bloqué' || status === 'bloque') return 1;
      if (prio === 'critical') return 2;
      if (!isPoint && t.due_date && t.due_date < today) return 3; // en retard
      if (!isPoint && t.due_date === today) return 4; // dues aujourd'hui
      if (prio === 'important' && !t.assigned_to) return 5;
      if (isPoint && t.due_date === today) return 6; // points à surveiller dus aujourd'hui
      return 7;
    };

    const sorted = [...byId.values()].sort((a, b) => {
      const d = score(a) - score(b);
      if (d !== 0) return d;
      return String(a.due_date ?? '').localeCompare(String(b.due_date ?? ''));
    });

    const list: WorkTodayItem[] = sorted.map((t: any) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: (t.manual_priority ?? t.computed_priority) as any,
      assignedTo: t.assigned_to,
    }));

    if (firstAction?.source === 'planning') {
      return list.filter(i => String(i.id) !== String(firstAction.sourceId));
    }
    return list;
  }, [planningTasks, overdueTasks, pointsWatch, firstAction, todayStr]);

  return (
    <MainLayout>
      <LayoutWrapper>
        {!hasFarm && user && (
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3 mb-6">
            <h2 className="text-lg font-semibold">Bienvenue sur NordAgri !</h2>
            <p className="text-sm text-muted-foreground">Créez votre ferme pour commencer.</p>
            <Button onClick={() => setShowCreateFarm(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Créer ma ferme
            </Button>
          </div>
        )}

        {user && (
          <CreateFarmDialog
            open={showCreateFarm}
            onOpenChange={setShowCreateFarm}
            userId={user.id}
            onFarmCreated={() => queryClient.invalidateQueries()}
          />
        )}

        {hasFarm && (
          <div className="space-y-4 lg:space-y-5 pb-24 lg:pb-8">
            <DashboardHeader
              firstName={profileData?.first_name}
              farmName={farmName}
              avatarUrl={(profileData as any)?.avatar_url ?? null}
            />

            <DashboardContextBar
              activeUsers={signals?.activeUsers ?? 0}
              unassignedTasks={signals?.unassignedTasks ?? 0}
              pointsToWatch={signals?.pointsToWatch ?? 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 min-w-0">
              {/* Left / main column */}
              <div className="lg:col-span-8 min-w-0 space-y-4 lg:space-y-5">
                <FirstActionCard action={firstAction} loading={false} />
                <WorkTodayCard items={workItems} limit={isMobile ? 3 : 5} loading={planningLoading} />

                <div className="lg:hidden">
                  <ActiveTeamCard
                    team={activeTeam}
                    loading={teamLoading}
                    unassignedCount={signals?.unassignedTasks ?? 0}
                  />
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-4 lg:gap-5">
                  <DesktopWatchPoints
                    items={pointsWatch?.examples ?? []}
                    criticalCount={pointsWatch?.criticalCount ?? 0}
                    importantCount={pointsWatch?.importantCount ?? 0}
                    loading={pointsLoading}
                  />
                  <FleetStatusCard farmId={farmId} />
                </div>

                <div className="hidden lg:block">
                  <WeekStatsCard farmId={farmId} />
                </div>
              </div>

              {/* Right column — desktop only */}
              <aside className="hidden lg:block lg:col-span-4 min-w-0 space-y-4 lg:space-y-5">
                <ActiveTeamCard
                  team={activeTeam}
                  loading={teamLoading}
                  unassignedCount={signals?.unassignedTasks ?? 0}
                />
                <BlockersCard farmId={farmId} />
                <RecentActivityCard farmId={farmId} />
              </aside>
            </div>

            {hasFarm && (
              <div className="hidden">
                <EmptyState
                  icon={emptyStates.dashboardOnboarding.icon}
                  title={emptyStates.dashboardOnboarding.title}
                  description={emptyStates.dashboardOnboarding.description}
                  action={{
                    label: emptyStates.dashboardOnboarding.actionLabel,
                    onClick: () => window.dispatchEvent(new CustomEvent('open-add-equipment-dialog')),
                  }}
                />
              </div>
            )}
          </div>
        )}
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Dashboard;
