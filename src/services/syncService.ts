
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SyncData {
  table: string;
  data: any[];
  lastSync?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime?: Date;
}

interface SyncResult {
  success: boolean;
  error?: string;
}

interface SyncOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  entity: string;
  data: any;
  createdAt: number;
  priority: number;
}

class SyncServiceClass {
  private listeners: ((status: SyncStatus) => void)[] = [];
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingSyncCount: 0
  };

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.updateStatus({ isOnline: true });
    });
    window.addEventListener('offline', () => {
      this.updateStatus({ isOnline: false });
    });
  }

  private updateStatus(updates: Partial<SyncStatus>) {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(listener => listener(this.status));
  }

  addEventListener(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: (status: SyncStatus) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  getStatus(): SyncStatus {
    return this.status;
  }

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
  }

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
  }

  /**
   * Get last sync timestamp for a table
   */
  getLastSyncTime(table: string): string | null {
    try {
      return localStorage.getItem(`lastSync_${table}`);
    } catch {
      return null;
    }
  }

  /**
   * Set last sync timestamp for a table
   */
  setLastSyncTime(table: string, timestamp: string): void {
    try {
      localStorage.setItem(`lastSync_${table}`, timestamp);
    } catch (error) {
      logger.error('Error setting sync time:', error);
    }
  }

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

  // Mock implementations for offline functionality
  async addOperation(operation: { type: 'add' | 'update' | 'delete', data: any, entity: string }): Promise<void> {
    // Mock implementation - in a real app, this would queue operations
    console.log('Operation queued:', operation);
  }

  async addToSyncQueue(type: 'add' | 'update' | 'delete', data: any, entity: string): Promise<number> {
    // Mock implementation
    console.log('Added to sync queue:', { type, data, entity });
    return Date.now();
  }

  async getSyncStats(): Promise<{ pending: number; failed: number }> {
    // Mock implementation
    return { pending: 0, failed: 0 };
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    // Mock implementation
    return [];
  }

  async sync(): Promise<SyncResult[]> {
    // Mock implementation
    this.updateStatus({ isSyncing: true });
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [{ success: true }];
    } finally {
      this.updateStatus({ isSyncing: false });
    }
  }

  async cacheQueryResult(key: string, data: any, table: string): Promise<void> {
    // Mock implementation
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  async getCachedQueryResult<T>(key: string): Promise<T | null> {
    // Mock implementation
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  async create(table: string, data: any): Promise<void> {
    // Mock implementation for offline create
    console.log('Offline create:', { table, data });
  }

  async update(table: string, id: string | number, data: any): Promise<void> {
    // Mock implementation for offline update
    console.log('Offline update:', { table, id, data });
  }

  async delete(table: string, id: string | number): Promise<void> {
    // Mock implementation for offline delete
    console.log('Offline delete:', { table, id });
  }
}

/**
 * Service for offline/online data synchronization
 */
export const syncService = new SyncServiceClass();
