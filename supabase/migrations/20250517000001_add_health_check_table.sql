
-- Create a table for connectivity checks
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'ok'
);

-- Insert an initial row
INSERT INTO health_check (status) VALUES ('ok');

-- Set up RLS to allow authenticated users to read
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reading health_check to authenticated users"
  ON health_check
  FOR SELECT
  TO authenticated
  USING (true);
