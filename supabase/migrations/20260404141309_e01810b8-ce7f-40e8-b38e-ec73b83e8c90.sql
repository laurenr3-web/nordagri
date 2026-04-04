
-- 1. Fix storage DELETE policy: only equipment owner can delete photos
DROP POLICY IF EXISTS "Authenticated users can delete equipment photos storage" ON storage.objects;
CREATE POLICY "Equipment owner can delete photos"
  ON storage.objects FOR DELETE
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

-- 2. Fix storage UPDATE policy: only equipment owner can update photos
DROP POLICY IF EXISTS "Authenticated users can update equipment photos storage" ON storage.objects;
CREATE POLICY "Equipment owner can update photos"
  ON storage.objects FOR UPDATE
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

-- 3. Fix storage INSERT policy: verify equipment ownership
DROP POLICY IF EXISTS "Authenticated users can upload equipment photos storage" ON storage.objects;
CREATE POLICY "Equipment owner can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'equipment_photos'
    AND auth.role() = 'authenticated'
  );

-- 4. Fix profiles SELECT policy: restrict to own profile + same farm members
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by owner or farm members"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.farm_members fm1
      JOIN public.farm_members fm2 ON fm1.farm_id = fm2.farm_id
      WHERE fm1.user_id = auth.uid()
        AND fm2.user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM public.farms f
      WHERE f.owner_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.farm_members fm
          WHERE fm.farm_id = f.id AND fm.user_id = profiles.id
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.farms f
      JOIN public.farm_members fm ON fm.farm_id = f.id
      WHERE fm.user_id = auth.uid()
        AND f.owner_id = profiles.id
    )
  );
