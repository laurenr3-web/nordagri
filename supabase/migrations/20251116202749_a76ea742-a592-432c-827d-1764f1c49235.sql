-- Create storage bucket for equipment photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment_photos', 'equipment_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for equipment_photos bucket
CREATE POLICY "Anyone can view equipment photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'equipment_photos');

CREATE POLICY "Authenticated users can upload equipment photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'equipment_photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their equipment photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'equipment_photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their equipment photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'equipment_photos' 
    AND auth.role() = 'authenticated'
  );