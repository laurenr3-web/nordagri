
-- Create a migration history table to track applied migrations
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checksum TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  applied_by TEXT
);

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS migration_history_name_idx ON migration_history(name);

-- Function to record a migration
CREATE OR REPLACE FUNCTION record_migration(
  p_name TEXT,
  p_checksum TEXT,
  p_status TEXT DEFAULT 'success'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO migration_history (name, checksum, status, applied_by)
  VALUES (
    p_name,
    p_checksum,
    p_status,
    current_user
  )
  ON CONFLICT (name) 
  DO UPDATE SET
    checksum = p_checksum,
    status = p_status,
    applied_at = now();
END;
$$ LANGUAGE plpgsql;
