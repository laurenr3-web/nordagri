CREATE OR REPLACE FUNCTION public.get_operational_stats(
  _farm_id uuid,
  _period text DEFAULT 'week',
  _employee_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_ts timestamptz;
  v_to_ts timestamptz;
  v_from_date date;
  v_to_date date;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_three_days_ago timestamptz := now() - interval '3 days';

  v_done_count integer;
  v_overdue_count integer;
  v_in_progress_count integer;
  v_avg_completion_hours numeric;
  v_per_employee jsonb;
  v_top_employee uuid;

  v_open_count integer;
  v_resolved_count integer;
  v_forgotten_count integer;
  v_avg_resolution_days numeric;

  v_avg_first_action_hours numeric;
BEGIN
  -- Authorization: only farm members may read these stats
  IF NOT public.is_farm_member(_farm_id) THEN
    RETURN NULL;
  END IF;

  -- Resolve period range [from, to]
  v_to_ts := date_trunc('day', now()) + interval '1 day' - interval '1 microsecond';
  IF _period = 'today' THEN
    v_from_ts := date_trunc('day', now());
  ELSIF _period = 'month' THEN
    v_from_ts := date_trunc('day', now()) - interval '29 days';
  ELSE
    -- default 'week' = last 7 days inclusive
    v_from_ts := date_trunc('day', now()) - interval '6 days';
  END IF;
  v_from_date := v_from_ts::date;
  v_to_date := v_to_ts::date;

  ----------------------------------------------------------------
  -- TASKS
  ----------------------------------------------------------------
  WITH base AS (
    SELECT
      t.id,
      t.status,
      t.due_date,
      t.completed_at,
      t.completed_by,
      t.created_at,
      t.assigned_to,
      t.created_by
    FROM public.planning_tasks t
    WHERE t.farm_id = _farm_id
      AND (
        _employee_id IS NULL
        OR t.assigned_to = _employee_id
        OR t.completed_by = _employee_id
        OR t.created_by  = _employee_id
      )
  ),
  done AS (
    SELECT * FROM base
    WHERE status = 'done'
      AND completed_at IS NOT NULL
      AND completed_at >= v_from_ts
      AND completed_at <= v_to_ts
  )
  SELECT
    (SELECT COUNT(*) FROM done),
    (SELECT COUNT(*) FROM base
       WHERE status <> 'done' AND due_date IS NOT NULL AND due_date < v_today),
    (SELECT COUNT(*) FROM base
       WHERE status <> 'done'
         AND due_date IS NOT NULL
         AND due_date >= v_from_date
         AND due_date <= v_to_date),
    (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600.0)
       FROM done
       WHERE completed_at IS NOT NULL AND created_at IS NOT NULL
         AND completed_at >= created_at)
  INTO v_done_count, v_overdue_count, v_in_progress_count, v_avg_completion_hours;

  -- Per-employee completed counts (from done tasks)
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('user_id', user_id, 'count', cnt) ORDER BY cnt DESC),
    '[]'::jsonb
  )
  INTO v_per_employee
  FROM (
    SELECT t.completed_by AS user_id, COUNT(*) AS cnt
    FROM public.planning_tasks t
    WHERE t.farm_id = _farm_id
      AND t.status = 'done'
      AND t.completed_at IS NOT NULL
      AND t.completed_at >= v_from_ts
      AND t.completed_at <= v_to_ts
      AND t.completed_by IS NOT NULL
      AND (
        _employee_id IS NULL
        OR t.assigned_to = _employee_id
        OR t.completed_by = _employee_id
        OR t.created_by  = _employee_id
      )
    GROUP BY t.completed_by
  ) sub;

  SELECT (v_per_employee->0->>'user_id')::uuid INTO v_top_employee;

  ----------------------------------------------------------------
  -- POINTS (with employee linkage filter)
  ----------------------------------------------------------------
  WITH base_points AS (
    SELECT p.*
    FROM public.points p
    WHERE p.farm_id = _farm_id
      AND (
        _employee_id IS NULL
        OR p.created_by = _employee_id
        OR EXISTS (
          SELECT 1 FROM public.point_events e
          WHERE e.point_id = p.id AND e.created_by = _employee_id
        )
      )
  ),
  resolved_in_period AS (
    SELECT * FROM base_points
    WHERE resolved_at IS NOT NULL
      AND resolved_at >= v_from_ts
      AND resolved_at <= v_to_ts
  ),
  points_in_period AS (
    SELECT * FROM base_points
    WHERE created_at >= v_from_ts AND created_at <= v_to_ts
  ),
  first_actions AS (
    SELECT e.point_id, MIN(e.created_at) AS first_at
    FROM public.point_events e
    WHERE e.event_type IN ('action', 'correction')
      AND e.point_id IN (SELECT id FROM points_in_period)
    GROUP BY e.point_id
  )
  SELECT
    (SELECT COUNT(*) FROM base_points WHERE status <> 'resolved'),
    (SELECT COUNT(*) FROM resolved_in_period),
    (SELECT COUNT(*) FROM base_points
       WHERE status <> 'resolved'
         AND last_event_at IS NOT NULL
         AND last_event_at < v_three_days_ago),
    (SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400.0)
       FROM resolved_in_period
       WHERE resolved_at >= created_at),
    (SELECT AVG(EXTRACT(EPOCH FROM (fa.first_at - p.created_at)) / 3600.0)
       FROM points_in_period p
       JOIN first_actions fa ON fa.point_id = p.id
       WHERE fa.first_at >= p.created_at)
  INTO v_open_count, v_resolved_count, v_forgotten_count, v_avg_resolution_days, v_avg_first_action_hours;

  RETURN jsonb_build_object(
    'tasks', jsonb_build_object(
      'done', COALESCE(v_done_count, 0),
      'overdue', COALESCE(v_overdue_count, 0),
      'inProgress', COALESCE(v_in_progress_count, 0),
      'perEmployee', COALESCE(v_per_employee, '[]'::jsonb),
      'topEmployeeId', v_top_employee
    ),
    'points', jsonb_build_object(
      'open', COALESCE(v_open_count, 0),
      'resolved', COALESCE(v_resolved_count, 0),
      'forgotten', COALESCE(v_forgotten_count, 0),
      'avgResolutionDays', v_avg_resolution_days
    ),
    'reactivity', jsonb_build_object(
      'avgFirstActionHours', v_avg_first_action_hours,
      'avgCompletionHours', v_avg_completion_hours
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_operational_stats(uuid, text, uuid) TO authenticated;