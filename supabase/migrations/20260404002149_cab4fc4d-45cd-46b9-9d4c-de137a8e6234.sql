
-- ============================================
-- NordAgri Complete Database Schema
-- ============================================

-- 1. FARMS
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size NUMERIC,
  size_unit TEXT DEFAULT 'hectares',
  location TEXT,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own farms" ON public.farms FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create farms" ON public.farms FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own farms" ON public.farms FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own farms" ON public.farms FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FARM_SETTINGS
CREATE TABLE IF NOT EXISTS public.farm_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_maintenance BOOLEAN DEFAULT true,
  show_fuel_log BOOLEAN DEFAULT true,
  show_parts BOOLEAN DEFAULT true,
  show_time_tracking BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.farm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm settings viewable by authenticated" ON public.farm_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Farm settings manageable by authenticated" ON public.farm_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. EQUIPMENT
CREATE TABLE IF NOT EXISTS public.equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  manufacturer TEXT,
  year INTEGER,
  serial_number TEXT,
  purchase_date TIMESTAMPTZ,
  location TEXT,
  status TEXT DEFAULT 'operational',
  type TEXT,
  category TEXT,
  image TEXT,
  notes TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  unite_d_usure TEXT DEFAULT 'heures',
  valeur_actuelle NUMERIC DEFAULT 0,
  last_wear_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own equipment" ON public.equipment FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own equipment" ON public.equipment FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own equipment" ON public.equipment FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- 5. EQUIPMENT_TYPES
CREATE TABLE IF NOT EXISTS public.equipment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment types viewable by authenticated" ON public.equipment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipment types manageable by authenticated" ON public.equipment_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. EQUIPMENT_CATEGORIES
CREATE TABLE IF NOT EXISTS public.equipment_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by authenticated" ON public.equipment_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories manageable by authenticated" ON public.equipment_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. EQUIPMENT_MAINTENANCE_SCHEDULE
CREATE TABLE IF NOT EXISTS public.equipment_maintenance_schedule (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'scheduled',
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_maintenance_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maintenance schedule viewable by authenticated" ON public.equipment_maintenance_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maintenance schedule manageable by authenticated" ON public.equipment_maintenance_schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. EQUIPMENT_QRCODES
CREATE TABLE IF NOT EXISTS public.equipment_qrcodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  qr_code_hash TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  last_scanned TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_qrcodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "QR codes viewable by authenticated" ON public.equipment_qrcodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "QR codes manageable by authenticated" ON public.equipment_qrcodes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. EQUIPMENT_LOGS
CREATE TABLE IF NOT EXISTS public.equipment_logs (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment logs viewable by authenticated" ON public.equipment_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipment logs manageable by authenticated" ON public.equipment_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. EQUIPMENT_PHOTOS
CREATE TABLE IF NOT EXISTS public.equipment_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment photos viewable by authenticated" ON public.equipment_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipment photos manageable by authenticated" ON public.equipment_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_equipment_photos_equipment_id ON public.equipment_photos(equipment_id);

-- 11. INTERVENTIONS
CREATE TABLE IF NOT EXISTS public.interventions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  equipment TEXT,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE SET NULL,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'medium',
  technician TEXT,
  date TIMESTAMPTZ,
  "scheduledDuration" NUMERIC DEFAULT 1,
  duration NUMERIC,
  notes TEXT,
  coordinates JSONB,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interventions viewable by authenticated" ON public.interventions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Interventions manageable by authenticated" ON public.interventions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. MAINTENANCE_TASKS
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  equipment TEXT,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'preventive',
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  estimated_duration NUMERIC,
  actual_duration NUMERIC,
  assigned_to TEXT,
  technician TEXT,
  notes TEXT,
  trigger_unit TEXT DEFAULT 'none',
  trigger_hours NUMERIC,
  trigger_kilometers NUMERIC,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maintenance tasks viewable by owner" ON public.maintenance_tasks FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Maintenance tasks insertable by authenticated" ON public.maintenance_tasks FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Maintenance tasks updatable by owner" ON public.maintenance_tasks FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Maintenance tasks deletable by owner" ON public.maintenance_tasks FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- 13. MAINTENANCE_PLANS
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE SET NULL,
  equipment_name TEXT,
  frequency TEXT DEFAULT 'monthly',
  "interval" INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'months',
  type TEXT DEFAULT 'preventive',
  priority TEXT DEFAULT 'medium',
  engine_hours NUMERIC DEFAULT 0,
  next_due_date TIMESTAMPTZ NOT NULL,
  last_performed_date TIMESTAMPTZ,
  assigned_to TEXT,
  active BOOLEAN DEFAULT true,
  trigger_unit TEXT DEFAULT 'none',
  trigger_hours NUMERIC,
  trigger_kilometers NUMERIC,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maintenance plans viewable by authenticated" ON public.maintenance_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maintenance plans manageable by authenticated" ON public.maintenance_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 14. PARTS_INVENTORY
CREATE TABLE IF NOT EXISTS public.parts_inventory (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  part_number TEXT,
  category TEXT,
  supplier TEXT,
  compatible_with TEXT[],
  quantity INTEGER DEFAULT 0,
  unit_price NUMERIC,
  location TEXT,
  reorder_threshold INTEGER DEFAULT 5,
  image_url TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parts_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parts viewable by owner" ON public.parts_inventory FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Parts insertable by authenticated" ON public.parts_inventory FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Parts updatable by owner" ON public.parts_inventory FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Parts deletable by owner" ON public.parts_inventory FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- 15. PARTS_WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.parts_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id INTEGER REFERENCES public.parts_inventory(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  custom_reason TEXT,
  intervention_id INTEGER REFERENCES public.interventions(id) ON DELETE SET NULL,
  comment TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parts_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Withdrawals viewable by authenticated" ON public.parts_withdrawals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Withdrawals manageable by authenticated" ON public.parts_withdrawals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Decrement stock function
CREATE OR REPLACE FUNCTION public.decrement_part_stock(p_part_id INTEGER, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.parts_inventory
  SET quantity = GREATEST(quantity - p_quantity, 0),
      updated_at = now()
  WHERE id = p_part_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. FUEL_LOGS
CREATE TABLE IF NOT EXISTS public.fuel_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  fuel_quantity_liters NUMERIC NOT NULL,
  price_per_liter NUMERIC,
  hours_at_fillup NUMERIC,
  notes TEXT,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fuel logs viewable by authenticated" ON public.fuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fuel logs manageable by authenticated" ON public.fuel_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 17. TASK_TYPES
CREATE TABLE IF NOT EXISTS public.task_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  affecte_compteur BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Task types viewable by authenticated" ON public.task_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Task types manageable by authenticated" ON public.task_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default task types
INSERT INTO public.task_types (name, affecte_compteur) VALUES
  ('maintenance', true),
  ('inspection', false),
  ('repair', true),
  ('transport', true),
  ('fieldwork', true),
  ('cleaning', false),
  ('other', false)
ON CONFLICT DO NOTHING;

-- 18. TIME_SESSIONS
CREATE TABLE IF NOT EXISTS public.time_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  equipment_id INTEGER REFERENCES public.equipment(id) ON DELETE SET NULL,
  intervention_id INTEGER REFERENCES public.interventions(id) ON DELETE SET NULL,
  task_type_id UUID REFERENCES public.task_types(id) ON DELETE SET NULL,
  custom_task_type TEXT,
  title TEXT,
  notes TEXT,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration NUMERIC,
  location TEXT,
  coordinates JSONB,
  technician TEXT,
  journee_id TEXT,
  poste_travail TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.time_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time sessions viewable by owner" ON public.time_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Time sessions insertable by authenticated" ON public.time_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Time sessions updatable by owner" ON public.time_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Time sessions deletable by owner" ON public.time_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 19. TEAM_MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  email TEXT,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members viewable by authenticated" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members manageable by authenticated" ON public.team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 20. LOCATIONS
CREATE TABLE IF NOT EXISTS public.locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  coordinates JSONB,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations viewable by authenticated" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Locations manageable by authenticated" ON public.locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 21. STORAGE_LOCATIONS
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Storage locations viewable by authenticated" ON public.storage_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Storage locations manageable by authenticated" ON public.storage_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 22. MANUFACTURERS
CREATE TABLE IF NOT EXISTS public.manufacturers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manufacturers viewable by authenticated" ON public.manufacturers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manufacturers manageable by authenticated" ON public.manufacturers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 23. NOTIFICATION_SETTINGS
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{}',
  maintenance_reminder_enabled BOOLEAN DEFAULT true,
  stock_low_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notification settings viewable by owner" ON public.notification_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notification settings manageable by owner" ON public.notification_settings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 24. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications viewable by owner" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Notifications manageable by owner" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 25. INVITATIONS
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invitations viewable by authenticated" ON public.invitations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Invitations manageable by authenticated" ON public.invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 26. FARM_MEMBERS
CREATE TABLE IF NOT EXISTS public.farm_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(farm_id, user_id)
);
ALTER TABLE public.farm_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm members viewable by authenticated" ON public.farm_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Farm members manageable by authenticated" ON public.farm_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for equipment photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment_photos', 'equipment_photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view equipment photos storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'equipment_photos');

CREATE POLICY "Authenticated users can upload equipment photos storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'equipment_photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update equipment photos storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'equipment_photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete equipment photos storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'equipment_photos' AND auth.role() = 'authenticated');
