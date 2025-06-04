
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SyncData {
  table: string;
  data: any[];
  lastSync?: string;
}

/**
 * Service for offline/online data synchronization
 */
export const syncService = {
  /**
   * Sync data from server
   */
  async syncFromServer(tables: string[] = []): Promise<{ [key: string]: any[] }> {
    const syncedData: { [key: string]: any[] } = {};
    
    // Valid table names from the schema
    const validTables = [
      'equipment', 'farms', 'equipment_categories', 'equipment_documents', 
      'equipment_logs', 'interventions', 'equipment_maintenance_schedule', 
      'equipment_qrcodes', 'equipment_types', 'farm_members', 'farm_settings',
      'fuel_logs', 'invitations', 'maintenance_plans', 'maintenance_records',
      'maintenance_tasks', 'manufacturers', 'notification_settings', 'notifications',
      'parts_inventory', 'profiles', 'regional_preferences', 'storage_locations',
      'subscriptions', 'task_types', 'team_members', 'time_sessions', 'user_roles',
      'user_settings', 'daily_time_summary'
    ];
    
    try {
      for (const table of tables) {
        if (!validTables.includes(table)) {
          logger.warn(`Invalid table name: ${table}. Skipping.`);
          continue;
        }
        
        logger.log(`Syncing data from table: ${table}`);
        
        const { data, error } = await supabase
          .from(table as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);
        
        if (error) {
          logger.error(`Error syncing ${table}:`, error);
          continue;
        }
        
        syncedData[table] = data || [];
        logger.log(`Synced ${data?.length || 0} records from ${table}`);
      }
      
      return syncedData;
    } catch (error) {
      logger.error('Error during sync:', error);
      throw error;
    }
  },

  /**
   * Sync data to server
   */
  async syncToServer(syncData: SyncData[]): Promise<boolean> {
    try {
      for (const { table, data } of syncData) {
        if (!data || data.length === 0) continue;
        
        logger.log(`Syncing ${data.length} records to ${table}`);
        
        // Batch insert/update operations
        const { error } = await supabase
          .from(table as any)
          .upsert(data, { onConflict: 'id' });
        
        if (error) {
          logger.error(`Error syncing to ${table}:`, error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error syncing to server:', error);
      return false;
    }
  },

  /**
   * Get last sync timestamp for a table
   */
  getLastSyncTime(table: string): string | null {
    try {
      return localStorage.getItem(`lastSync_${table}`);
    } catch {
      return null;
    }
  },

  /**
   * Set last sync timestamp for a table
   */
  setLastSyncTime(table: string, timestamp: string): void {
    try {
      localStorage.setItem(`lastSync_${table}`, timestamp);
    } catch (error) {
      logger.error('Error setting sync time:', error);
    }
  },

  /**
   * Check if sync is needed
   */
  isSyncNeeded(table: string, maxAge: number = 300000): boolean {
    const lastSync = this.getLastSyncTime(table);
    if (!lastSync) return true;
    
    const lastSyncTime = new Date(lastSync).getTime();
    const now = Date.now();
    
    return (now - lastSyncTime) > maxAge;
  }
};
