import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { useActiveTimeEntry } from '@/hooks/time-tracking/useActiveTimeEntry';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { useGlobalStore } from '@/store';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    channel: vi.fn()
  }
}));

vi.mock('@/services/supabase/timeTrackingService', () => ({
  timeTrackingService: {
    getActiveTimeEntry: vi.fn()
  }
}));

vi.mock('@/store', () => ({
  useGlobalStore: vi.fn()
}));

vi.mock('@/utils/dateHelpers', () => ({
  formatDuration: vi.fn((ms) => `${Math.floor(ms / 60000)}m`)
}));

describe('useActiveTimeEntry', () => {
  const mockSetTimeTracking = vi.fn();
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    vi.mocked(useGlobalStore).mockReturnValue(mockSetTimeTracking);
    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with loading state', () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any);

    const { result } = renderHook(() => useActiveTimeEntry());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activeTimeEntry).toBe(null);
  });

  it('should fetch active time entry when user is logged in', async () => {
    const mockActiveEntry = {
      id: 'entry-123',
      user_id: 'user-123',
      task_type: 'maintenance' as const,
      start_time: '2025-01-15T10:00:00Z',
      status: 'active' as const,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123' } 
        } 
      },
      error: null
    } as any);

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockResolvedValue(mockActiveEntry);

    const { result } = renderHook(() => useActiveTimeEntry());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeTimeEntry).toBeTruthy();
    expect(result.current.activeTimeEntry?.id).toBe('entry-123');
    expect(mockSetTimeTracking).toHaveBeenCalledWith({
      isRunning: true,
      activeSessionId: 'entry-123'
    });
  });

  it('should handle no active entry', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123' } 
        } 
      },
      error: null
    } as any);

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockResolvedValue(null);

    const { result } = renderHook(() => useActiveTimeEntry());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeTimeEntry).toBe(null);
    expect(mockSetTimeTracking).toHaveBeenCalledWith({
      isRunning: false,
      activeSessionId: null
    });
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch');
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123' } 
        } 
      },
      error: null
    } as any);

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockRejectedValue(error);

    const { result } = renderHook(() => useActiveTimeEntry());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.activeTimeEntry).toBe(null);
  });

  it('should update duration every second for active entries', async () => {
    const mockActiveEntry = {
      id: 'entry-123',
      user_id: 'user-123',
      task_type: 'maintenance' as const,
      start_time: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      status: 'active' as const,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123' } 
        } 
      },
      error: null
    } as any);

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockResolvedValue(mockActiveEntry);

    const { result } = renderHook(() => useActiveTimeEntry());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialDuration = result.current.activeTimeEntry?.current_duration;

    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Duration should be updated
    expect(result.current.activeTimeEntry?.current_duration).toBeTruthy();
  });

  it('should not update duration for paused entries', async () => {
    const mockPausedEntry = {
      id: 'entry-123',
      user_id: 'user-123',
      task_type: 'maintenance' as const,
      start_time: new Date(Date.now() - 60000).toISOString(),
      status: 'paused' as const,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123' } 
        } 
      },
      error: null
    } as any);

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockResolvedValue(mockPausedEntry);

    const { result } = renderHook(() => useActiveTimeEntry());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialEntry = result.current.activeTimeEntry;

    // Advance time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Entry should remain the same (no updates)
    expect(result.current.activeTimeEntry).toEqual(initialEntry);
  });

  it('should refresh active time entry on demand', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123' } 
        } 
      },
      error: null
    } as any);

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockResolvedValue(null);

    const { result } = renderHook(() => useActiveTimeEntry());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock a new active entry
    const newEntry = {
      id: 'new-entry',
      user_id: 'user-123',
      task_type: 'repair' as const,
      start_time: '2025-01-15T11:00:00Z',
      status: 'active' as const,
      created_at: '2025-01-15T11:00:00Z',
      updated_at: '2025-01-15T11:00:00Z'
    };

    vi.mocked(timeTrackingService.getActiveTimeEntry).mockResolvedValue(newEntry);

    await act(async () => {
      await result.current.refreshActiveTimeEntry();
    });

    expect(result.current.activeTimeEntry?.id).toBe('new-entry');
  });

  it('should setup realtime subscription', () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any);

    renderHook(() => useActiveTimeEntry());

    expect(supabase.channel).toHaveBeenCalledWith('time_sessions_changes');
    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });
});
