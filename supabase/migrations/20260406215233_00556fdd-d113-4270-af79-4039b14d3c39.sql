
-- Drop the FK from planning_tasks.assigned_to -> team_members
ALTER TABLE public.planning_tasks DROP CONSTRAINT IF EXISTS planning_tasks_assigned_to_fkey;

-- Add FK from planning_tasks.assigned_to -> farm_members.id
ALTER TABLE public.planning_tasks 
  ADD CONSTRAINT planning_tasks_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.farm_members(id) ON DELETE SET NULL;
