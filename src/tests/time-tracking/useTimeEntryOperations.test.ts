
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimeEntryOperations } from '@/hooks/time-tracking/useTimeEntryOperations';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    }
  }
}));

vi.mock('@/services/supabase/timeTrackingService', () => ({
  timeTrackingService: {
    startTimeEntry: vi.fn(),
    stopTimeEntry: vi.fn(),
    pauseTimeEntry: vi.fn(),
    resumeTimeEntry: vi.fn()
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/utils/authUtils', () => ({
  checkAuthStatus: vi.fn().mockResolvedValue(true),
  checkTablePermissions: vi.fn().mockResolvedValue(true)
}));

describe('useTimeEntryOperations', () => {
  const mockSession = {
    user: { id: 'user-123' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    } as any);
  });

  describe('startTimeEntry', () => {
    it('should start time entry successfully', async () => {
      const mockEntry = {
        id: 'entry-123',
        user_id: 'user-123',
        task_type: 'maintenance' as const,
        start_time: '2025-01-15T10:00:00Z',
        status: 'active' as const
      };

      vi.mocked(timeTrackingService.startTimeEntry).mockResolvedValue(mockEntry as any);

      const { result } = renderHook(() => useTimeEntryOperations());

      let newEntry;
      await act(async () => {
        newEntry = await result.current.startTimeEntry({
          task_type: 'maintenance',
          equipment_id: 1,
          location: 'Test Location'
        });
      });

      expect(timeTrackingService.startTimeEntry).toHaveBeenCalledWith('user-123', {
        task_type: 'maintenance',
        equipment_id: 1,
        location: 'Test Location'
      });
      expect(newEntry).toEqual(mockEntry);
      expect(toast.success).toHaveBeenCalledWith('Time tracking started', {
        description: 'The timer is now running.'
      });
    });

    it('should handle missing user session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      } as any);

      const { result } = renderHook(() => useTimeEntryOperations());

      await expect(
        act(async () => {
          await result.current.startTimeEntry({
            task_type: 'maintenance'
          });
        })
      ).rejects.toThrow('You must be logged in to track time.');

      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle start errors', async () => {
      const error = new Error('Failed to start');
      vi.mocked(timeTrackingService.startTimeEntry).mockRejectedValue(error);

      const { result } = renderHook(() => useTimeEntryOperations());

      await expect(
        act(async () => {
          await result.current.startTimeEntry({
            task_type: 'maintenance'
          });
        })
      ).rejects.toThrow('Failed to start');

      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle location_id by creating location name', async () => {
      const mockEntry = {
        id: 'entry-123',
        user_id: 'user-123',
        task_type: 'maintenance' as const,
        start_time: '2025-01-15T10:00:00Z',
        status: 'active' as const
      };

      vi.mocked(timeTrackingService.startTimeEntry).mockResolvedValue(mockEntry as any);

      const { result } = renderHook(() => useTimeEntryOperations());

      await act(async () => {
        await result.current.startTimeEntry({
          task_type: 'maintenance',
          location_id: 42
        });
      });

      expect(timeTrackingService.startTimeEntry).toHaveBeenCalledWith('user-123', {
        task_type: 'maintenance',
        location_id: 42,
        location: 'Location 42'
      });
    });
  });

  describe('stopTimeEntry', () => {
    it('should stop time entry successfully', async () => {
      vi.mocked(timeTrackingService.stopTimeEntry).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTimeEntryOperations());

      await act(async () => {
        await result.current.stopTimeEntry('entry-123');
      });

      expect(timeTrackingService.stopTimeEntry).toHaveBeenCalledWith('entry-123');
      expect(toast.success).toHaveBeenCalledWith('Time tracking stopped', {
        description: 'Your time entry has been saved.'
      });
    });

    it('should handle stop errors', async () => {
      const error = new Error('Failed to stop');
      vi.mocked(timeTrackingService.stopTimeEntry).mockRejectedValue(error);

      const { result } = renderHook(() => useTimeEntryOperations());

      await expect(
        act(async () => {
          await result.current.stopTimeEntry('entry-123');
        })
      ).rejects.toThrow('Failed to stop');

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('pauseTimeEntry', () => {
    it('should pause time entry successfully', async () => {
      vi.mocked(timeTrackingService.pauseTimeEntry).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTimeEntryOperations());

      await act(async () => {
        await result.current.pauseTimeEntry('entry-123');
      });

      expect(timeTrackingService.pauseTimeEntry).toHaveBeenCalledWith('entry-123');
      expect(toast.success).toHaveBeenCalledWith('Time tracking paused', {
        description: 'You can resume later.'
      });
    });

    it('should handle pause errors', async () => {
      const error = new Error('Failed to pause');
      vi.mocked(timeTrackingService.pauseTimeEntry).mockRejectedValue(error);

      const { result } = renderHook(() => useTimeEntryOperations());

      await expect(
        act(async () => {
          await result.current.pauseTimeEntry('entry-123');
        })
      ).rejects.toThrow('Failed to pause');

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('resumeTimeEntry', () => {
    it('should resume time entry successfully', async () => {
      vi.mocked(timeTrackingService.resumeTimeEntry).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTimeEntryOperations());

      await act(async () => {
        await result.current.resumeTimeEntry('entry-123');
      });

      expect(timeTrackingService.resumeTimeEntry).toHaveBeenCalledWith('entry-123');
      expect(toast.success).toHaveBeenCalledWith('Time tracking resumed', {
        description: 'The timer is running again.'
      });
    });

    it('should handle resume errors', async () => {
      const error = new Error('Failed to resume');
      vi.mocked(timeTrackingService.resumeTimeEntry).mockRejectedValue(error);

      const { result } = renderHook(() => useTimeEntryOperations());

      await expect(
        act(async () => {
          await result.current.resumeTimeEntry('entry-123');
        })
      ).rejects.toThrow('Failed to resume');

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
