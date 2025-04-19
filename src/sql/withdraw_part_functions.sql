
-- SQL functions for part withdrawals
-- These need to be executed in Supabase SQL editor

-- Function to withdraw a part and update inventory
CREATE OR REPLACE FUNCTION withdraw_part(
  p_part_id BIGINT,
  p_quantity INTEGER,
  p_equipment_id INTEGER DEFAULT NULL,
  p_task_id BIGINT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_farm_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_farm_id UUID;
  v_current_stock INTEGER;
  v_withdrawal_id UUID;
BEGIN
  -- Get current user ID from auth.uid()
  v_user_id := auth.uid();
  
  -- If farm_id not provided, get it from the user's profile
  IF p_farm_id IS NULL THEN
    SELECT farm_id INTO v_farm_id
    FROM profiles
    WHERE id = v_user_id;
  ELSE
    v_farm_id := p_farm_id;
  END IF;
  
  -- Check if there's enough stock
  SELECT quantity INTO v_current_stock
  FROM parts_inventory
  WHERE id = p_part_id;
  
  IF v_current_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuffisant. Disponible: %, Demandé: %', v_current_stock, p_quantity;
  END IF;
  
  -- Insert withdrawal record
  INSERT INTO parts_withdrawals (
    part_id,
    quantity,
    withdrawn_by,
    equipment_id,
    task_id,
    notes,
    farm_id
  ) VALUES (
    p_part_id,
    p_quantity,
    v_user_id,
    p_equipment_id,
    p_task_id,
    p_notes,
    v_farm_id
  )
  RETURNING id INTO v_withdrawal_id;
  
  -- Update inventory
  UPDATE parts_inventory
  SET 
    quantity = quantity - p_quantity,
    updated_at = now()
  WHERE id = p_part_id;
  
  RETURN v_withdrawal_id;
END;
$$;

-- Function to get all part withdrawals with additional details
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get current user's farm_id
  DECLARE v_farm_id UUID;
  BEGIN
    SELECT farm_id INTO v_farm_id
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN QUERY
    SELECT 
      w.id,
      w.part_id,
      w.quantity,
      w.withdrawn_by,
      w.withdrawn_at,
      w.equipment_id,
      w.task_id,
      w.notes,
      w.farm_id,
      w.created_at,
      p.name AS part_name,
      e.name AS equipment_name,
      CONCAT(pr.first_name, ' ', pr.last_name) AS user_name
    FROM parts_withdrawals w
    LEFT JOIN parts_inventory p ON w.part_id = p.id
    LEFT JOIN equipment e ON w.equipment_id = e.id
    LEFT JOIN profiles pr ON w.withdrawn_by = pr.id
    WHERE w.farm_id = v_farm_id
    ORDER BY w.withdrawn_at DESC;
  END;
END;
$$;

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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get current user's farm_id
  DECLARE v_farm_id UUID;
  BEGIN
    SELECT farm_id INTO v_farm_id
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN QUERY
    SELECT 
      w.id,
      w.part_id,
      w.quantity,
      w.withdrawn_by,
      w.withdrawn_at,
      w.equipment_id,
      w.task_id,
      w.notes,
      w.farm_id,
      w.created_at,
      p.name AS part_name,
      e.name AS equipment_name,
      CONCAT(pr.first_name, ' ', pr.last_name) AS user_name
    FROM parts_withdrawals w
    LEFT JOIN parts_inventory p ON w.part_id = p.id
    LEFT JOIN equipment e ON w.equipment_id = e.id
    LEFT JOIN profiles pr ON w.withdrawn_by = pr.id
    WHERE w.part_id = part_id_param AND w.farm_id = v_farm_id
    ORDER BY w.withdrawn_at DESC;
  END;
END;
$$;
