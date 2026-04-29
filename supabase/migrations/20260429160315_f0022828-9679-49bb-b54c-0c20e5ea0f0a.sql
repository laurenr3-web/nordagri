-- Table points
CREATE TABLE public.points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'autre',
  entity_id uuid,
  entity_label text,
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_event_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_points_farm_status ON public.points(farm_id, status);
CREATE INDEX idx_points_last_event_at ON public.points(last_event_at DESC);

ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Points viewable by farm member"
ON public.points FOR SELECT TO authenticated
USING (public.is_farm_member(farm_id));

CREATE POLICY "Points insertable by farm member"
ON public.points FOR INSERT TO authenticated
WITH CHECK (public.has_farm_role(farm_id, 'member') AND created_by = auth.uid());

CREATE POLICY "Points updatable by farm member"
ON public.points FOR UPDATE TO authenticated
USING (public.has_farm_role(farm_id, 'member'));

CREATE POLICY "Points deletable by admin or creator"
ON public.points FOR DELETE TO authenticated
USING (public.has_farm_role(farm_id, 'admin') OR created_by = auth.uid());

-- Table point_events (timeline immuable)
CREATE TABLE public.point_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id uuid NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'note',
  note text,
  photo_urls text[] NOT NULL DEFAULT '{}',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_point_events_point_id ON public.point_events(point_id, created_at DESC);

ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Point events viewable by farm member"
ON public.point_events FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.points p
  WHERE p.id = point_events.point_id AND public.is_farm_member(p.farm_id)
));

CREATE POLICY "Point events insertable by farm member"
ON public.point_events FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.points p
    WHERE p.id = point_events.point_id AND public.has_farm_role(p.farm_id, 'member')
  )
);

-- Trigger : mise à jour automatique de last_event_at et updated_at
CREATE OR REPLACE FUNCTION public.touch_point_on_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.points
  SET last_event_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.point_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_point_on_event
AFTER INSERT ON public.point_events
FOR EACH ROW EXECUTE FUNCTION public.touch_point_on_event();

-- Trigger updated_at sur points (modifications directes)
CREATE TRIGGER trg_points_updated_at
BEFORE UPDATE ON public.points
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bucket point_photos (privé)
INSERT INTO storage.buckets (id, name, public)
VALUES ('point_photos', 'point_photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies : accès aux fichiers du bucket via membership de la ferme du point parent.
-- Convention : path = "{farm_id}/{point_id}/{filename}"
CREATE POLICY "Point photos viewable by farm member"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'point_photos'
  AND public.is_farm_member(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "Point photos uploadable by farm member"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'point_photos'
  AND public.has_farm_role(((storage.foldername(name))[1])::uuid, 'member')
);

CREATE POLICY "Point photos updatable by farm member"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'point_photos'
  AND public.has_farm_role(((storage.foldername(name))[1])::uuid, 'member')
);

CREATE POLICY "Point photos deletable by farm admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'point_photos'
  AND public.has_farm_role(((storage.foldername(name))[1])::uuid, 'admin')
);