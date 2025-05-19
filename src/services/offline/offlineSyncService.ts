import { IndexedDBService } from './indexedDBService';
import { SyncOperationType } from '@/providers/OfflineProvider';

// Define types for sync operations
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entity: string;
  data: any;
  createdAt: number;
  priority: number;
  status: 'pending' | 'processing' | 'failed' | 'complete';
  attempts: number;
  errorMessage?: string;
}

// Main service for handling offline synchronization
export class OfflineSyncService {
  private dbService: IndexedDBService;
  private isProcessing: boolean = false;
  private maxRetries: number = 3;

  constructor(dbService: IndexedDBService) {
    this.dbService = dbService;
  }

  // Add an operation to the sync queue
  async queueOperation(
    type: SyncOperationType,
    entity: string,
    data: any,
    priority: number = 5
  ): Promise<string> {
    const id = crypto.randomUUID();
    const operation: SyncOperation = {
      id,
      type,
      entity,
      data,
      createdAt: Date.now(),
      priority,
      status: 'pending',
      attempts: 0
    };

    await this.dbService.addToStore('syncOperations', operation);
    return id;
  }

  // Get all pending operations
  async getPendingOperations(): Promise<SyncOperation[]> {
    try {
      const operations = await this.dbService.getAllFromStore('syncOperations');
      return operations.filter((op: SyncOperation) => 
        op.status === 'pending' || op.status === 'failed'
      );
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  }

  // Get the count of pending operations
  async getPendingOperationsCount(): Promise<number> {
    const operations = await this.getPendingOperations();
    return operations.length;
  }

  // Process all pending operations
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.isProcessing) {
      return { success: 0, failed: 0 };
    }

    this.isProcessing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const operations = await this.getPendingOperations();
      
      // Sort by priority (higher first) then by creation time
      const sortedOperations = operations.sort((a, b) => {
        if (a.priority === b.priority) {
          return a.createdAt - b.createdAt; // Older first
        }
        return b.priority - a.priority; // Higher priority first
      });

      for (const operation of sortedOperations) {
        try {
          // Mark as processing
          await this.updateOperationStatus(operation.id, 'processing');
          
          // Process based on entity type and operation type
          await this.processOperation(operation);
          
          // Mark as complete and remove
          await this.updateOperationStatus(operation.id, 'complete');
          await this.dbService.deleteFromStore('syncOperations', operation.id);
          
          successCount++;
        } catch (error) {
          // Handle failure
          const newAttempts = operation.attempts + 1;
          const status = newAttempts >= this.maxRetries ? 'failed' : 'pending';
          
          await this.dbService.updateInStore('syncOperations', operation.id, {
            status,
            attempts: newAttempts,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
          
          if (status === 'failed') {
            failedCount++;
          }
        }
      }

      return { success: successCount, failed: failedCount };
    } finally {
      this.isProcessing = false;
    }
  }

  // Update operation status
  private async updateOperationStatus(
    id: string,
    status: SyncOperation['status'],
    errorMessage?: string
  ): Promise<void> {
    await this.dbService.updateInStore('syncOperations', id, { 
      status, 
      ...(errorMessage && { errorMessage })
    });
  }

  // Process a single operation
  private async processOperation(operation: SyncOperation): Promise<void> {
    // Implementation would depend on the entity and type
    // This is where you'd make API calls to your backend
    
    switch (operation.entity) {
      case 'interventions':
        // Handle intervention operations
        break;
      case 'equipment':
        // Handle equipment operations
        break;
      case 'parts':
        // Handle parts operations
        break;
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }
}
