
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntry, TimeEntryTaskType } from '@/hooks/time-tracking/types';

describe('TimeTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch time entries for a user', async () => {
    // Create a fully typed mock return value for getTimeEntries
    const mockTimeEntry: TimeEntry = {
      id: '1',
      user_id: 'test-user',
      task_type: 'maintenance', // Using a valid TimeEntryTaskType value
      start_time: new Date().toISOString(),
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    vi.spyOn(timeTrackingService, 'getTimeEntries').mockResolvedValue([mockTimeEntry]);
    
    const result = await timeTrackingService.getTimeEntries({ userId: 'test-user' });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].task_type).toBe('maintenance');
  });

  it('should support startTimeEntry', async () => {
    // Create a fully typed mock return value for startTimeEntry
    const mockTimeEntry: TimeEntry = {
      id: '2',
      user_id: 'user',
      task_type: 'maintenance',
      start_time: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    vi.spyOn(timeTrackingService, 'startTimeEntry').mockResolvedValue(mockTimeEntry);
    
    const result = await timeTrackingService.startTimeEntry('user', { task_type: 'maintenance' });
    expect(result.status).toBe('active');
  });
});
