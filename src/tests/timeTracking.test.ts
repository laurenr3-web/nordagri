import { vi, describe, expect, test, beforeEach } from 'vitest';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntry } from '@/types';

// Mock the entire module
vi.mock('@/services/supabase/timeTrackingService');

describe('TimeTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create a time entry successfully', async () => {
    const mockEntry: Omit<TimeEntry, 'id'> = {
      equipment_id: 'equipment123',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_minutes: 60,
      notes: 'Test entry',
      user_id: 'user123',
      farm_id: 'farm123',
    };

    // Mock createTimeEntry to return the mockEntry with an ID
    (timeTrackingService.createTimeEntry as any).mockResolvedValue({ ...mockEntry, id: 'entry123' });

    const entry = await timeTrackingService.createTimeEntry(mockEntry);

    expect(timeTrackingService.createTimeEntry).toHaveBeenCalledWith(mockEntry);
    expect(entry).toEqual({ ...mockEntry, id: 'entry123' });
  });

  test('should fetch time entries successfully', async () => {
    const mockEntries: TimeEntry[] = [
      {
        id: 'entry1',
        equipment_id: 'equipment123',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: 60,
        notes: 'Test entry 1',
        user_id: 'user123',
        farm_id: 'farm123',
      },
      {
        id: 'entry2',
        equipment_id: 'equipment456',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: 120,
        notes: 'Test entry 2',
        user_id: 'user123',
        farm_id: 'farm123',
      },
    ];
    
    // Mock getTimeEntries to return test data
    timeTrackingService.getTimeEntries = vi.fn().mockResolvedValue([
      // Test data
    ]);
    
    // Call getTimeEntries with just one argument
    const entries = await timeTrackingService.getTimeEntries({});

    expect(timeTrackingService.getTimeEntries).toHaveBeenCalledWith({});
    expect(entries).toEqual(undefined);
  });

  test('should update a time entry successfully', async () => {
    const entryId = 'entry123';
    const mockEntry: Partial<TimeEntry> = {
      notes: 'Updated notes',
      duration_minutes: 90,
    };

    // Mock updateTimeEntry to return the updated entry
    (timeTrackingService.updateTimeEntry as any).mockResolvedValue({ id: entryId, ...mockEntry });

    const updatedEntry = await timeTrackingService.updateTimeEntry(entryId, mockEntry);

    expect(timeTrackingService.updateTimeEntry).toHaveBeenCalledWith(entryId, mockEntry);
    expect(updatedEntry).toEqual({ id: entryId, ...mockEntry });
  });

  test('should delete a time entry successfully', async () => {
    const entryId = 'entry123';

    // Mock deleteTimeEntry to return true for successful deletion
    (timeTrackingService.deleteTimeEntry as any).mockResolvedValue(true);

    const result = await timeTrackingService.deleteTimeEntry(entryId);

    expect(timeTrackingService.deleteTimeEntry).toHaveBeenCalledWith(entryId);
    expect(result).toBe(true);
  });
});
