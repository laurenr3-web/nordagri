ALTER TABLE public.work_shifts REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.work_shifts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;