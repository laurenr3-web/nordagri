
import React, { useState } from 'react';
import { Plus, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { EmployeeView } from './EmployeeView';
import { AddTaskForm } from './AddTaskForm';
import { useFarmId } from '@/hooks/useFarmId';
import { useAuthContext } from '@/providers/AuthProvider';
import { usePlanningTasks } from '@/hooks/planning/usePlanningTasks';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

function getDateStr(offset: number = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export function PlanningContent() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'global' | 'employee'>('global');
  const { farmId } = useFarmId();
  const { user } = useAuthContext();

  const todayStr = getDateStr(0);
  const tomorrowStr = getDateStr(1);

  const { addTask, getComputedPriority } = usePlanningTasks(farmId, todayStr, todayStr);

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
        // For owner without farm_members entry, use a synthetic id
        const isOwner = farm?.owner_id === p.id;
        return {
          id: fm?.id || p.id, // farm_members.id for FK, or profile id for owner
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Sans nom',
          isOwner,
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
      {/* View toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(v) => { if (v) setViewMode(v as 'global' | 'employee'); }}
        className="w-full"
      >
        <ToggleGroupItem value="global" className="flex-1 gap-1.5 text-sm">
          <List className="h-4 w-4" /> Globale
        </ToggleGroupItem>
        <ToggleGroupItem value="employee" className="flex-1 gap-1.5 text-sm">
          <Users className="h-4 w-4" /> Par employé
        </ToggleGroupItem>
      </ToggleGroup>

      {viewMode === 'global' ? (
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-11">
            <TabsTrigger value="today" className="text-sm font-medium">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="tomorrow" className="text-sm font-medium">Demain</TabsTrigger>
            <TabsTrigger value="week" className="text-sm font-medium">Semaine</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="today" className="mt-0">
              <DayView farmId={farmId} date={todayStr} label="Aujourd'hui" teamMembers={teamMembers as any[]} userId={user?.id ?? null} />
            </TabsContent>
            <TabsContent value="tomorrow" className="mt-0">
              <DayView farmId={farmId} date={tomorrowStr} label="Demain" teamMembers={teamMembers as any[]} />
            </TabsContent>
            <TabsContent value="week" className="mt-0">
              <WeekView farmId={farmId} teamMembers={teamMembers as any[]} />
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <EmployeeView farmId={farmId} date={todayStr} teamMembers={teamMembers as any[]} />
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
