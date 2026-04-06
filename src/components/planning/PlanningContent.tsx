
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
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
  const { farmId } = useFarmId();
  const { user } = useAuthContext();

  const todayStr = getDateStr(0);
  const tomorrowStr = getDateStr(1);

  const { addTask, getComputedPriority } = usePlanningTasks(farmId, todayStr, todayStr);

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', farmId],
    queryFn: async () => {
      if (!farmId) return [];
      const { data } = await supabase.from('team_members').select('id, name').eq('farm_id', farmId);
      return data || [];
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
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-11">
          <TabsTrigger value="today" className="text-sm font-medium">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="tomorrow" className="text-sm font-medium">Demain</TabsTrigger>
          <TabsTrigger value="week" className="text-sm font-medium">Semaine</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="today" className="mt-0">
            <DayView farmId={farmId} date={todayStr} label="Aujourd'hui" teamMembers={teamMembers as any[]} />
          </TabsContent>
          <TabsContent value="tomorrow" className="mt-0">
            <DayView farmId={farmId} date={tomorrowStr} label="Demain" teamMembers={teamMembers as any[]} />
          </TabsContent>
          <TabsContent value="week" className="mt-0">
            <WeekView farmId={farmId} teamMembers={teamMembers as any[]} />
          </TabsContent>
        </div>
      </Tabs>

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
