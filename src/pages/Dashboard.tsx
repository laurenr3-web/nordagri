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

import { DashboardHeader } from '@/components/dashboard/v2/DashboardHeader';
import { DashboardContextBar } from '@/components/dashboard/v2/DashboardContextBar';
import { FirstActionCard } from '@/components/dashboard/v2/FirstActionCard';
import { WorkTodayCard, type WorkTodayItem } from '@/components/dashboard/v2/WorkTodayCard';
import { ActiveTeamCard } from '@/components/dashboard/v2/ActiveTeamCard';
import { DesktopWatchPoints } from '@/components/dashboard/v2/DesktopWatchPoints';
import { FleetStatusCard } from '@/components/dashboard/v2/FleetStatusCard';

const Dashboard: React.FC = () => {
  const { user, profileData } = useAuthContext();
  const queryClient = useQueryClient();
  const { farmId, farmName } = useFarmId();
  const hasFarm = !!farmId;
  const [showCreateFarm, setShowCreateFarm] = useState(false);

  const todayStr = todayLocal();

  const firstAction = useFirstAction(farmId);
  const { data: signals } = useDashboardSignals(farmId);
  const { data: activeTeam = [], isLoading: teamLoading } = useActiveTeam(farmId);
  const { tasks: planningTasks = [], isLoading: planningLoading } = usePlanningTasks(farmId, todayStr, todayStr) as any;
  const { data: pointsWatch, isLoading: pointsLoading } = usePointsWatchData(farmId, hasFarm);

  // Build today's work items, exclude the First Action source to avoid repetition
  const workItems = useMemo<WorkTodayItem[]>(() => {
    const list: WorkTodayItem[] = (planningTasks ?? [])
      .filter((t: any) => t.status !== 'done')
      .map((t: any) => ({
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
  }, [planningTasks, firstAction]);

  return (
    <MainLayout>
      <LayoutWrapper>
        {/* Banner: no farm yet */}
        {!hasFarm && user && (
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3 mb-6">
            <h2 className="text-lg font-semibold">Bienvenue sur NordAgri !</h2>
            <p className="text-sm text-muted-foreground">
              Créez votre ferme pour commencer.
            </p>
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
          <div className="space-y-4 lg:space-y-6 pb-24 lg:pb-8">
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

            {/* Mobile single column / desktop 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Main column */}
              <div className="lg:col-span-8 space-y-4 lg:space-y-6">
                <FirstActionCard action={firstAction} loading={false} />
                <WorkTodayCard items={workItems} limit={3} loading={planningLoading} />
                <div className="lg:hidden">
                  <ActiveTeamCard
                    team={activeTeam}
                    loading={teamLoading}
                    unassignedCount={signals?.unassignedTasks ?? 0}
                  />
                </div>

                {/* Desktop-only secondary blocks under main column */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                  <DesktopWatchPoints
                    items={pointsWatch?.examples ?? []}
                    criticalCount={pointsWatch?.criticalCount ?? 0}
                    importantCount={pointsWatch?.importantCount ?? 0}
                    loading={pointsLoading}
                  />
                  <FleetStatusCard farmId={farmId} />
                </div>
              </div>

              {/* Right column: desktop only */}
              <aside className="hidden lg:block lg:col-span-4 space-y-4 lg:space-y-6">
                <ActiveTeamCard
                  team={activeTeam}
                  loading={teamLoading}
                  unassignedCount={signals?.unassignedTasks ?? 0}
                />
                <FleetStatusCard farmId={farmId} />
              </aside>
            </div>

            {/* Onboarding empty hint when no equipment yet */}
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
