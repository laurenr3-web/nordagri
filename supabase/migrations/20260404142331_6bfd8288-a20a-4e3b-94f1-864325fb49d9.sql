
-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'equipment_photos';

-- Remove the public SELECT policy
DROP POLICY IF EXISTS "Anyone can view equipment photos storage" ON storage.objects;

-- Add authenticated SELECT policy with ownership check
CREATE POLICY "Equipment owner can view photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'equipment_photos'
    AND EXISTS (
      SELECT 1 FROM public.equipment_photos ep
      JOIN public.equipment e ON e.id = ep.equipment_id
      WHERE ep.photo_url LIKE '%' || storage.objects.name
        AND e.owner_id = auth.uid()
    )
  );
