-- Allow event creators (or farm admins) to update or delete their timeline events
CREATE POLICY "Point events updatable by creator or admin"
ON public.point_events
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.points p
    WHERE p.id = point_events.point_id
      AND has_farm_role(p.farm_id, 'admin'::text)
  )
)
WITH CHECK (
  (created_by = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.points p
    WHERE p.id = point_events.point_id
      AND has_farm_role(p.farm_id, 'admin'::text)
  )
);

CREATE POLICY "Point events deletable by creator or admin"
ON public.point_events
FOR DELETE
TO authenticated
USING (
  (created_by = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.points p
    WHERE p.id = point_events.point_id
      AND has_farm_role(p.farm_id, 'admin'::text)
  )
);