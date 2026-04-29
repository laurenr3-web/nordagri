-- Remap planning_tasks.assigned_to from farm_members.id to user_id where applicable
UPDATE planning_tasks pt
SET assigned_to = fm.user_id
FROM farm_members fm
WHERE pt.assigned_to = fm.id
  AND pt.assigned_to IS NOT NULL;
