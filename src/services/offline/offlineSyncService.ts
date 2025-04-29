
/**
 * Service for handling offline data synchronization
 */

export type SyncQueueItem = {
  id: string;
  type: 'add_equipment' | 'update_equipment' | 'add_intervention' | 'update_intervention' | 'add_part' | 'update_part';
  data: any;
  timestamp: number;
  retries: number;
  processed: boolean;
  error?: string;
};

export type SyncProgress = {
  total: number;
  completed: number;
  failed: number;
};

export class OfflineSyncService {
  private static syncQueue: SyncQueueItem[] = [];
  private static cachedData: Record<string, { data: any, expiresAt: number }> = {};

  // Initialize sync queue from localStorage
  static init() {
    try {
      const storedQueue = localStorage.getItem('offline_sync_queue');
      if (storedQueue) {
        this.syncQueue = JSON.parse(storedQueue);
      }

      const storedCache = localStorage.getItem('offline_data_cache');
      if (storedCache) {
        this.cachedData = JSON.parse(storedCache);
      }
    } catch (error) {
      console.error('Error initializing offline sync service:', error);
      // Reset if there's an error
      this.syncQueue = [];
      this.cachedData = {};
    }
  }

  // Save sync queue to localStorage
  private static saveQueue() {
    localStorage.setItem('offline_sync_queue', JSON.stringify(this.syncQueue));
  }

  // Save cache to localStorage
  private static saveCache() {
    localStorage.setItem('offline_data_cache', JSON.stringify(this.cachedData));
  }

  // Add item to sync queue
  static addToSyncQueue(type: SyncQueueItem['type'], data: any): string {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const item: SyncQueueItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      processed: false
    };
    
    this.syncQueue.push(item);
    this.saveQueue();
    
    return id;
  }

  // Get all pending items in sync queue
  static getPendingItems(): SyncQueueItem[] {
    return this.syncQueue.filter(item => !item.processed);
  }

  // Mark an item as processed
  static markAsProcessed(id: string, error?: string) {
    const item = this.syncQueue.find(item => item.id === id);
    if (item) {
      item.processed = true;
      if (error) {
        item.error = error;
      }
      this.saveQueue();
    }
  }

  // Cache data with an expiration time
  static cacheData<T>(key: string, data: T, expirationMinutes: number = 60) {
    const expiresAt = Date.now() + expirationMinutes * 60 * 1000;
    this.cachedData[key] = { data, expiresAt };
    this.saveCache();
  }

  // Get cached data if not expired
  static getCachedData<T>(key: string): T | null {
    const cached = this.cachedData[key];
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    return null;
  }

  // Clear expired cache entries
  static cleanupCache() {
    const now = Date.now();
    let changed = false;
    
    for (const key in this.cachedData) {
      if (this.cachedData[key].expiresAt < now) {
        delete this.cachedData[key];
        changed = true;
      }
    }
    
    if (changed) {
      this.saveCache();
    }
  }

  // Clear processed items older than a certain time
  static cleanupQueue(olderThanHours = 24) {
    const threshold = Date.now() - olderThanHours * 60 * 60 * 1000;
    this.syncQueue = this.syncQueue.filter(
      item => !item.processed || item.timestamp >= threshold
    );
    this.saveQueue();
  }
}

// Initialize on service load
OfflineSyncService.init();
