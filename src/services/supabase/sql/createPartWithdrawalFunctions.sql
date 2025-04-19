
-- Function to get all part withdrawals with related info
CREATE OR REPLACE FUNCTION get_part_withdrawals()
RETURNS TABLE (
  id UUID,
  part_id BIGINT,
  quantity INTEGER,
  withdrawn_by UUID,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  equipment_id INTEGER,
  task_id BIGINT,
  notes TEXT,
  farm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  part_name TEXT,
  equipment_name TEXT,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pw.id,
    pw.part_id,
    pw.quantity,
    pw.withdrawn_by,
    pw.withdrawn_at,
    pw.equipment_id,
    pw.task_id,
    pw.notes,
    pw.farm_id,
    pw.created_at,
    pi.name as part_name,
    eq.name as equipment_name,
    COALESCE(prof.first_name || ' ' || prof.last_name, 'Unknown user') as user_name
  FROM
    parts_withdrawals pw
  LEFT JOIN
    parts_inventory pi ON pw.part_id = pi.id
  LEFT JOIN
    equipment eq ON pw.equipment_id = eq.id
  LEFT JOIN
    profiles prof ON pw.withdrawn_by = prof.id
  WHERE
    pw.farm_id IN (
      SELECT farm_id FROM profiles WHERE id = auth.uid()
    )
  ORDER BY
    pw.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get withdrawals for a specific part
CREATE OR REPLACE FUNCTION get_withdrawals_for_part(part_id_param BIGINT)
RETURNS TABLE (
  id UUID,
  part_id BIGINT,
  quantity INTEGER,
  withdrawn_by UUID,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  equipment_id INTEGER,
  task_id BIGINT,
  notes TEXT,
  farm_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  part_name TEXT,
  equipment_name TEXT,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pw.id,
    pw.part_id,
    pw.quantity,
    pw.withdrawn_by,
    pw.withdrawn_at,
    pw.equipment_id,
    pw.task_id,
    pw.notes,
    pw.farm_id,
    pw.created_at,
    pi.name as part_name,
    eq.name as equipment_name,
    COALESCE(prof.first_name || ' ' || prof.last_name, 'Unknown user') as user_name
  FROM
    parts_withdrawals pw
  LEFT JOIN
    parts_inventory pi ON pw.part_id = pi.id
  LEFT JOIN
    equipment eq ON pw.equipment_id = eq.id
  LEFT JOIN
    profiles prof ON pw.withdrawn_by = prof.id
  WHERE
    pw.part_id = part_id_param AND
    pw.farm_id IN (
      SELECT farm_id FROM profiles WHERE id = auth.uid()
    )
  ORDER BY
    pw.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
