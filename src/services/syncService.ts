
// Sync service implementation
type Operation = {
  type: string;
  entity: string;
  data: any;
  priority: number;
};

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncedAt: Date | null;
  syncErrors: Error[];
}

class SyncService {
  private pendingOperations: Operation[] = [];
  private listeners: Map<string, ((status: SyncStatus) => void)[]> = new Map();
  private status: SyncStatus = {
    isOnline: true,
    isSyncing: false,
    pendingSyncCount: 0,
    lastSyncedAt: null,
    syncErrors: []
  };

  constructor() {
    // Initialize sync service
    this.loadPendingOperationsFromStorage();
  }

  // Add a new operation to the sync queue
  async addOperation(operation: Operation): Promise<void> {
    this.pendingOperations.push(operation);
    this.status.pendingSyncCount = this.pendingOperations.length;
    
    // Save to IndexedDB or localStorage
    await this.savePendingOperationsToStorage();
    
    // Notify listeners
    this.notifyListeners();
    
    return Promise.resolve();
  }

  // Get pending operations count
  async getPendingOperationsCount(): Promise<number> {
    return this.pendingOperations.length;
  }

  // Sync pending operations
  async syncPendingOperations(): Promise<void> {
    if (this.status.isSyncing || !this.status.isOnline || this.pendingOperations.length === 0) {
      return Promise.resolve();
    }

    this.status.isSyncing = true;
    this.notifyListeners();

    try {
      // Sort by priority (lower number = higher priority)
      const sortedOperations = [...this.pendingOperations].sort((a, b) => a.priority - b.priority);
      
      // Process operations in order
      for (const operation of sortedOperations) {
        // Here would be the actual API call to your backend
        // For now, we'll just simulate success
        console.log(`Processing operation: ${operation.type} for ${operation.entity}`, operation.data);
        
        // Remove from queue after successful processing
        const index = this.pendingOperations.findIndex(op => 
          op.type === operation.type && 
          op.entity === operation.entity && 
          op.data === operation.data
        );
        
        if (index !== -1) {
          this.pendingOperations.splice(index, 1);
        }
      }

      // Update status
      this.status.lastSyncedAt = new Date();
      this.status.pendingSyncCount = 0;
      this.pendingOperations = [];
      
      // Save updated state
      await this.savePendingOperationsToStorage();
    } catch (error) {
      console.error("Error syncing operations:", error);
      if (error instanceof Error) {
        this.status.syncErrors.push(error);
      } else {
        this.status.syncErrors.push(new Error("Unknown sync error"));
      }
    } finally {
      this.status.isSyncing = false;
      this.notifyListeners();
    }

    return Promise.resolve();
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Load pending operations from storage
  private async loadPendingOperationsFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('pendingOperations');
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
        this.status.pendingSyncCount = this.pendingOperations.length;
      }
    } catch (error) {
      console.error("Error loading pending operations:", error);
    }
    
    return Promise.resolve();
  }

  // Save pending operations to storage
  private async savePendingOperationsToStorage(): Promise<void> {
    try {
      localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error("Error saving pending operations:", error);
    }
    
    return Promise.resolve();
  }

  // Event listener management
  addEventListener(event: string, callback: (status: SyncStatus) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)?.push(callback);
  }

  removeEventListener(event: string, callback: (status: SyncStatus) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(): void {
    const statusListeners = this.listeners.get('statusChange');
    if (statusListeners) {
      for (const listener of statusListeners) {
        listener(this.getStatus());
      }
    }
  }

  // Cache related methods
  async cacheQueryResult<T>(key: string, data: T, tableName: string): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        tableName
      };
      
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Error caching query result:", error);
    }
    
    return Promise.resolve();
  }

  async getCachedQueryResult<T>(key: string): Promise<T | null> {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data as T;
        }
      }
    } catch (error) {
      console.error("Error retrieving cached query result:", error);
    }
    
    return null;
  }

  // CRUD operations for offline mode
  async create(tableName: string, data: any): Promise<void> {
    return this.addOperation({
      type: 'create',
      entity: tableName,
      data,
      priority: 1
    });
  }

  async update(tableName: string, id: string | number, data: any): Promise<void> {
    return this.addOperation({
      type: 'update',
      entity: tableName,
      data: { id, ...data },
      priority: 2
    });
  }

  async delete(tableName: string, id: string | number): Promise<void> {
    return this.addOperation({
      type: 'delete',
      entity: tableName,
      data: { id },
      priority: 3
    });
  }

  // Set online/offline status
  setOnlineStatus(isOnline: boolean): void {
    if (this.status.isOnline !== isOnline) {
      this.status.isOnline = isOnline;
      this.notifyListeners();
    }
  }

  // Methods for integration with an actual backend
  async sync(): Promise<void> {
    return this.syncPendingOperations();
  }
}

// Create and export a singleton instance
export const syncService = new SyncService();

// Hook for accessing the sync service
export function useSyncService() {
  return syncService;
}
