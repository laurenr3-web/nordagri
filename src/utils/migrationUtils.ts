
import { supabase } from '@/integrations/supabase/client';

/**
 * Vérifie si une migration a déjà été appliquée
 * @param migrationName Nom de la migration
 * @returns true si la migration a déjà été appliquée
 */
export async function isMigrationApplied(migrationName: string): Promise<boolean> {
  try {
    // Vérifier si la table migrations existe
    const { error: tableError } = await supabase
      .from('migrations' as any)
      .select('id')
      .limit(1);

    // Si la table n'existe pas, aucune migration n'est appliquée
    if (tableError) {
      console.warn('Table migrations not found, assuming no migrations applied');
      return false;
    }
    
    // Vérifier si la migration existe
    const { data, error } = await supabase
      .from('migrations' as any)
      .select('id')
      .eq('name', migrationName)
      .limit(1);
      
    if (error) {
      console.error('Error checking migration:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error('Error in isMigrationApplied:', err);
    return false;
  }
}

/**
 * Appliquer une migration SQL
 * @param migrationName Nom de la migration (sans extension .sql)
 * @param sqlContent Contenu SQL de la migration
 * @returns true si la migration a été appliquée avec succès
 */
export async function applyMigration(migrationName: string, sqlContent: string): Promise<boolean> {
  try {
    const isApplied = await isMigrationApplied(migrationName);
    
    if (isApplied) {
      console.log(`Migration ${migrationName} already applied`);
      return true;
    }
    
    // Instead of using rpc which requires predefined functions, use a direct SQL query
    const { error } = await supabase
      .rpc('pg_query' as any, { query: sqlContent });
    
    if (error) {
      console.error('Error applying migration:', error);
      return false;
    }
    
    console.log(`Migration ${migrationName} applied successfully`);
    return true;
  } catch (err) {
    console.error('Error in applyMigration:', err);
    return false;
  }
}
