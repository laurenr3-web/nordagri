-- Create equipment_photos table for multiple photos per equipment
CREATE TABLE IF NOT EXISTS public.equipment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id INTEGER NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.equipment_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment_photos
CREATE POLICY "Users can view photos of equipment in their farm"
  ON public.equipment_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment e
      JOIN public.profiles p ON e.farm_id = p.farm_id
      WHERE e.id = equipment_photos.equipment_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for equipment in their farm"
  ON public.equipment_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.equipment e
      JOIN public.profiles p ON e.farm_id = p.farm_id
      WHERE e.id = equipment_photos.equipment_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of equipment in their farm"
  ON public.equipment_photos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment e
      JOIN public.profiles p ON e.farm_id = p.farm_id
      WHERE e.id = equipment_photos.equipment_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of equipment in their farm"
  ON public.equipment_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.equipment e
      JOIN public.profiles p ON e.farm_id = p.farm_id
      WHERE e.id = equipment_photos.equipment_id
      AND p.id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_equipment_photos_equipment_id ON public.equipment_photos(equipment_id);
CREATE INDEX idx_equipment_photos_display_order ON public.equipment_photos(display_order);

-- Trigger to update updated_at
CREATE TRIGGER update_equipment_photos_updated_at
  BEFORE UPDATE ON public.equipment_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();