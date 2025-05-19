
// Updating only the problematic function in syncService.ts

/**
 * Update an entity for offline first
 */
public async update<T>(storeName: string, id: string | number, data: T): Promise<void> {
  await IndexedDBService.updateById(storeName, id, {
    ...data,
    _updatedAt: Date.now(),
    _isOffline: true
  });
  await this.addToSyncQueue('update', { id, ...data }, storeName);
}
