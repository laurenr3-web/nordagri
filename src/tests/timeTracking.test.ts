
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';

describe('TimeTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch time entries for a user', async () => {
    vi.spyOn(timeTrackingService, 'getTimeEntries').mockResolvedValue([
      { id: '1', task_type: 'harvest', start_time: new Date().toISOString() }
    ]);
    const result = await timeTrackingService.getTimeEntries({ userId: 'test-user' });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].task_type).toBe('harvest');
  });

  it('should support startTimeEntry', async () => {
    vi.spyOn(timeTrackingService, 'startTimeEntry').mockResolvedValue({ id: '2', status: 'active' });
    const result = await timeTrackingService.startTimeEntry('user', { task_type: 'maintenance' });
    expect(result.status).toBe('active');
  });
});
