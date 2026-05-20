
-- Drop existing reference-table policies explicitly
DROP POLICY IF EXISTS "Locations viewable by farm member" ON public.locations;
DROP POLICY IF EXISTS "Locations insertable by farm member" ON public.locations;
DROP POLICY IF EXISTS "Storage locations viewable by farm member" ON public.storage_locations;
DROP POLICY IF EXISTS "Storage locations insertable by farm member" ON public.storage_locations;
DROP POLICY IF EXISTS "Manufacturers viewable by farm member" ON public.manufacturers;
DROP POLICY IF EXISTS "Manufacturers insertable by farm member" ON public.manufacturers;
DROP POLICY IF EXISTS "Equipment types viewable by farm member" ON public.equipment_types;
DROP POLICY IF EXISTS "Equipment types insertable by farm member" ON public.equipment_types;

CREATE POLICY "Locations viewable by farm member" ON public.locations
  FOR SELECT TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Locations insertable by farm member" ON public.locations
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

CREATE POLICY "Storage locations viewable by farm member" ON public.storage_locations
  FOR SELECT TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Storage locations insertable by farm member" ON public.storage_locations
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

CREATE POLICY "Manufacturers viewable by farm member" ON public.manufacturers
  FOR SELECT TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Manufacturers insertable by farm member" ON public.manufacturers
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

CREATE POLICY "Equipment types viewable by farm member" ON public.equipment_types
  FOR SELECT TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Equipment types insertable by farm member" ON public.equipment_types
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

-- Storage: equipment_photos for farm members
DROP POLICY IF EXISTS "Equipment owner can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Equipment owner can update photos" ON storage.objects;
DROP POLICY IF EXISTS "Equipment owner can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Farm members can view equipment photos" ON storage.objects;
DROP POLICY IF EXISTS "Farm members can update equipment photos" ON storage.objects;
DROP POLICY IF EXISTS "Farm members can delete equipment photos" ON storage.objects;

CREATE POLICY "Farm members can view equipment photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'equipment_photos' AND EXISTS (
    SELECT 1 FROM public.equipment_photos ep
    WHERE ep.photo_url LIKE '%' || objects.name
      AND public.owns_equipment(ep.equipment_id)
  )
);
CREATE POLICY "Farm members can update equipment photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'equipment_photos' AND EXISTS (
    SELECT 1 FROM public.equipment_photos ep
    WHERE ep.photo_url LIKE '%' || objects.name
      AND public.can_write_equipment(ep.equipment_id, 'member')
  )
);
CREATE POLICY "Farm members can delete equipment photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'equipment_photos' AND EXISTS (
    SELECT 1 FROM public.equipment_photos ep
    WHERE ep.photo_url LIKE '%' || objects.name
      AND public.can_write_equipment(ep.equipment_id, 'member')
  )
);
