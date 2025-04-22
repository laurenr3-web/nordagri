
-- This file contains SQL helper functions for the ERP integration
-- You would normally include this in a proper migration file

-- Function to create the erp_accounting_entries table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_erp_accounting_entries_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the table already exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'erp_accounting_entries'
    ) THEN
        -- Create the table
        CREATE TABLE public.erp_accounting_entries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type TEXT NOT NULL,
            cost_center TEXT NOT NULL,
            amount NUMERIC NOT NULL,
            reference TEXT,
            description TEXT,
            entry_date DATE NOT NULL,
            equipment_id INTEGER REFERENCES public.equipment(id),
            fuel_log_id UUID REFERENCES public.fuel_logs(id),
            time_session_id UUID REFERENCES public.time_sessions(id),
            maintenance_id TEXT, -- Matches the format in your system
            part_id INTEGER REFERENCES public.parts_inventory(id),
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );

        -- Add comments
        COMMENT ON TABLE public.erp_accounting_entries IS 'Stores accounting entries for ERP integration';
        
        -- Add RLS policies
        ALTER TABLE public.erp_accounting_entries ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Service role can manage all entries" 
        ON public.erp_accounting_entries 
        USING (true)
        WITH CHECK (true);
        
        -- Add updated_at trigger
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.erp_accounting_entries
        FOR EACH ROW
        EXECUTE PROCEDURE public.update_timestamp();
        
        RAISE NOTICE 'Created erp_accounting_entries table';
    ELSE
        RAISE NOTICE 'Table erp_accounting_entries already exists';
    END IF;
END;
$$;
