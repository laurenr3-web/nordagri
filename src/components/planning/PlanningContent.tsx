
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, User, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { EmployeeView } from './EmployeeView';
import { AddTaskForm } from './AddTaskForm';
import { CompletedTasksView } from './CompletedTasksView';
import { WorkShiftBar } from '@/components/work-shifts';
import { useFarmId } from '@/hooks/useFarmId';
import { useAuthContext } from '@/providers/AuthProvider';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PlanningTask } from '@/services/planning/planningService';
import { localDateStr } from '@/lib/dateLocal';


function getDateStr(offset: number = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return localDateStr(d);
}

type ViewMode = 'mine' | 'all' | 'employee';

export function PlanningContent() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('mine');
  const { farmId } = useFarmId();
  const { user } = useAuthContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = ['today', 'tomorrow', 'week', 'completed'].includes(searchParams.get('tab') || '')
    ? (searchParams.get('tab') as string)
    : 'today';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const handleTabChange = (v: string) => {
    setActiveTab(v);
    const next = new URLSearchParams(searchParams);
    if (v === 'today') next.delete('tab');
    else next.set('tab', v);
    setSearchParams(next, { replace: true });
  };

  const todayStr = getDateStr(0);
  const tomorrowStr = getDateStr(1);

  const { addTask, getComputedPriority } = usePlanningTasks(farmId, todayStr, todayStr);

  // Allow nested empty states to request opening the AddTaskForm.
  React.useEffect(() => {
    const handler = () => setShowAddForm(true);
    window.addEventListener('planning:open-add-task', handler);
    return () => window.removeEventListener('planning:open-add-task', handler);
  }, []);

  // Fetch farm members (from farm_members + profiles + owner)
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['farmMembersForPlanning', farmId],
    queryFn: async () => {
      if (!farmId) return [];

      // Get farm owner
      const { data: farm } = await supabase.from('farms').select('owner_id').eq('id', farmId).single();

      // Get farm_members
      const { data: members } = await supabase
        .from('farm_members')
        .select('id, user_id, role')
        .eq('farm_id', farmId);

      const userIds = new Set<string>();
      const memberMap = new Map<string, { id: string; role: string }>();

      if (farm?.owner_id) userIds.add(farm.owner_id);
      for (const m of members || []) {
        userIds.add(m.user_id);
        memberMap.set(m.user_id, { id: m.id, role: m.role || 'member' });
      }

      if (userIds.size === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', Array.from(userIds));

      return (profiles || []).map(p => {
        const fm = memberMap.get(p.id);
        const isOwner = farm?.owner_id === p.id;
        return {
          // Always use auth user id as the canonical member id so it matches
          // planning_tasks.assigned_to (which stores user_id).
          id: p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Sans nom',
          isOwner,
          userId: p.id,
          legacyMemberId: fm?.id,
        };
      });
    },
    enabled: !!farmId,
  });

  // Fetch equipment
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipmentList', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data } = await supabase.from('equipment').select('id, name').eq('farm_id', farmId);
      return data || [];
    },
    enabled: !!farmId,
  });

  // Find the current user's farm_member id for filtering
  const currentUserMemberId = useMemo(() => {
    if (!user) return null;
    const member = teamMembers.find(m => m.userId === user.id);
    return member?.id ?? null;
  }, [user, teamMembers]);

  // Task filter for "mine" view: show unassigned + assigned to me
  const taskFilter = useMemo(() => {
    if (viewMode !== 'mine' || !currentUserMemberId) return undefined;
    return (task: PlanningTask) => !task.assigned_to || task.assigned_to === currentUserMemberId;
  }, [viewMode, currentUserMemberId]);

  const handleAddTask = (task: any) => {
    if (!user) return;
    addTask.mutate({
      ...task,
      created_by: user.id,
      assigned_to: task.assigned_to === 'none' ? null : task.assigned_to,
      equipment_id: task.equipment_id && task.equipment_id !== 'none' ? task.equipment_id : null,
      manual_priority: task.manual_priority === 'auto' ? null : task.manual_priority,
    });
  };

  return (
    <div className="space-y-4">
      <WorkShiftBar />

      {/* View toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(v) => { if (v) setViewMode(v as ViewMode); }}
        className="w-full"
      >
        <ToggleGroupItem value="mine" className="flex-1 gap-1.5 text-sm">
          <User className="h-4 w-4" /> Mes tâches
        </ToggleGroupItem>
        <ToggleGroupItem value="all" className="flex-1 gap-1.5 text-sm">
          <List className="h-4 w-4" /> Toutes
        </ToggleGroupItem>
        <ToggleGroupItem value="employee" className="flex-1 gap-1.5 text-sm">
          <Users className="h-4 w-4" /> Par employé
        </ToggleGroupItem>
      </ToggleGroup>

      {viewMode === 'employee' ? (
        <EmployeeView farmId={farmId} teamMembers={teamMembers as any[]} />
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-11">
            <TabsTrigger value="today" className="text-xs sm:text-sm font-medium px-1">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="tomorrow" className="text-xs sm:text-sm font-medium px-1">Demain</TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm font-medium px-1">Semaine</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm font-medium px-1">Terminées</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="today" className="mt-0">
              <DayView farmId={farmId} date={todayStr} label="Aujourd'hui" teamMembers={teamMembers as any[]} userId={user?.id ?? null} taskFilter={taskFilter} />
            </TabsContent>
            <TabsContent value="tomorrow" className="mt-0">
              <DayView farmId={farmId} date={tomorrowStr} label="Demain" teamMembers={teamMembers as any[]} userId={user?.id ?? null} taskFilter={taskFilter} />
            </TabsContent>
            <TabsContent value="week" className="mt-0">
              <WeekView farmId={farmId} teamMembers={teamMembers as any[]} taskFilter={taskFilter} />
            </TabsContent>
            <TabsContent value="completed" className="mt-0">
              <CompletedTasksView farmId={farmId} teamMembers={teamMembers as any[]} currentUserId={user?.id ?? null} />
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* FAB */}
      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 lg:bottom-6 lg:right-6"
        onClick={() => setShowAddForm(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddTaskForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddTask}
        teamMembers={teamMembers as any[]}
        equipment={equipment as any[]}
      />
    </div>
  );
}
