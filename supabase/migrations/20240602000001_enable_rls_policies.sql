
-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Farms: Users can only see farms they own or are members of
CREATE POLICY "Users can view accessible farms" ON farms
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM farm_members 
      WHERE farm_id = farms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only farm owners can update farms" ON farms
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can create farms" ON farms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only farm owners can delete farms" ON farms
  FOR DELETE USING (auth.uid() = owner_id);

-- Farm Members: Users can only see members of farms they have access to
CREATE POLICY "Users can view farm members" ON farm_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = farm_members.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members fm 
          WHERE fm.farm_id = farms.id AND fm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Farm owners can manage members" ON farm_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = farm_members.farm_id AND owner_id = auth.uid()
    )
  );

-- Equipment: Users can only access equipment from farms they belong to
CREATE POLICY "Users can view accessible equipment" ON equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = equipment.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = farms.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Farm members can modify equipment" ON equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = equipment.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = farms.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Maintenance Tasks: Users can only access tasks for equipment they have access to
CREATE POLICY "Users can view accessible maintenance tasks" ON maintenance_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM equipment e
      JOIN farms f ON e.farm_id = f.id
      WHERE e.id = maintenance_tasks.equipment_id AND (
        f.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = f.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Farm members can manage maintenance tasks" ON maintenance_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM equipment e
      JOIN farms f ON e.farm_id = f.id
      WHERE e.id = maintenance_tasks.equipment_id AND (
        f.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = f.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Fuel Logs: Users can only access fuel logs for equipment they have access to
CREATE POLICY "Users can view accessible fuel logs" ON fuel_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM equipment e
      JOIN farms f ON e.farm_id = f.id
      WHERE e.id = fuel_logs.equipment_id AND (
        f.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = f.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Farm members can manage fuel logs" ON fuel_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM equipment e
      JOIN farms f ON e.farm_id = f.id
      WHERE e.id = fuel_logs.equipment_id AND (
        f.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = f.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Parts Inventory: Users can only access parts for their farms
CREATE POLICY "Users can view accessible parts" ON parts_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = parts_inventory.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = farms.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Farm members can manage parts" ON parts_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = parts_inventory.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = farms.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Parts Withdrawals: Users can only access withdrawals for their farms
CREATE POLICY "Users can view accessible withdrawals" ON parts_withdrawals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = parts_withdrawals.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = farms.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Farm members can manage withdrawals" ON parts_withdrawals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE id = parts_withdrawals.farm_id AND (
        owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM farm_members 
          WHERE farm_id = farms.id AND user_id = auth.uid()
        )
      )
    )
  );

-- Time Sessions: Users can only see their own time sessions
CREATE POLICY "Users can view own time sessions" ON time_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own time sessions" ON time_sessions
  FOR ALL USING (auth.uid() = user_id);
