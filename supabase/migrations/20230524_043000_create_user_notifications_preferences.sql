
-- This migration adds a table to store user notification preferences
-- for email and SMS notifications

-- Create user_notifications_preferences table
CREATE TABLE IF NOT EXISTS user_notifications_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  farm_id UUID REFERENCES farms(id) NOT NULL,
  
  -- Email notifications
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  email_low_stock BOOLEAN NOT NULL DEFAULT true,
  email_low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  email_maintenance_reminder BOOLEAN NOT NULL DEFAULT true,
  email_maintenance_reminder_days INTEGER NOT NULL DEFAULT 2,
  
  -- SMS notifications
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_phone TEXT,
  sms_low_stock BOOLEAN NOT NULL DEFAULT false,
  sms_maintenance_reminder BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT user_notifications_preferences_user_id_key UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE user_notifications_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON user_notifications_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notification preferences
CREATE POLICY "Users can update their own notification preferences"
  ON user_notifications_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Farm admins can view notification preferences for their farm
CREATE POLICY "Farm admins can view notification preferences for their farm"
  ON user_notifications_preferences
  FOR SELECT
  USING (
    farm_id IN (
      SELECT farm_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Create trigger to update timestamp
CREATE TRIGGER update_user_notifications_preferences_updated_at
  BEFORE UPDATE ON user_notifications_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE update_timestamp();

-- Record migration
SELECT record_migration(
  '20230524_043000_create_user_notifications_preferences',
  md5('20230524_043000_create_user_notifications_preferences.sql')
);
