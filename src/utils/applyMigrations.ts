
import { supabase } from '@/integrations/supabase/client';
import { isMigrationApplied, applyMigration } from './migrationUtils';
import { toast } from 'sonner';

/**
 * Apply all pending migrations in order
 */
export async function applyPendingMigrations(): Promise<void> {
  try {
    console.log('Checking for pending migrations...');
    
    // Get all migration files from the database
    const initialMigration = `
      -- Ce fichier représente le schéma initial de la base de données
      -- Il servira de référence pour les migrations futures

      -- Création d'un table migrations pour suivre les migrations exécutées
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Insérer cette migration initiale
      INSERT INTO migrations (name) VALUES ('00000000000000_initial_schema');
    `;

    // First, ensure the initial migration is applied
    const initialMigrationName = '00000000000000_initial_schema';
    const isInitialMigrationApplied = await isMigrationApplied(initialMigrationName);
    
    if (!isInitialMigrationApplied) {
      console.log('Applying initial migration...');
      await applyMigration(initialMigrationName, initialMigration);
    }

    // Apply the time_sessions optimization migration if not already applied
    const optimizeMigrationName = '20250421000001_optimize_time_sessions';
    const isOptimizeMigrationApplied = await isMigrationApplied(optimizeMigrationName);
    
    if (!isOptimizeMigrationApplied) {
      const optimizeMigrationSQL = `
        -- Migration pour optimiser la table time_sessions

        -- Création d'un index sur user_id et start_time pour accélérer les requêtes
        CREATE INDEX IF NOT EXISTS idx_time_sessions_user_start_time 
        ON time_sessions (user_id, start_time);

        -- Création d'un index sur le status pour filtrer rapidement les sessions actives
        CREATE INDEX IF NOT EXISTS idx_time_sessions_status 
        ON time_sessions (status);

        -- Création d'un index sur journee_id pour regrouper les sessions par journée
        CREATE INDEX IF NOT EXISTS idx_time_sessions_journee_id 
        ON time_sessions (journee_id);

        -- Mettre à jour la table migrations
        INSERT INTO migrations (name) VALUES ('20250421000001_optimize_time_sessions');
      `;
      
      console.log('Applying time_sessions optimization migration...');
      await applyMigration(optimizeMigrationName, optimizeMigrationSQL);
    }

    console.log('Migration check complete.');
    toast.success('Database migrations are up to date');
  } catch (error) {
    console.error('Error applying migrations:', error);
    toast.error('Failed to apply database migrations');
  }
}
