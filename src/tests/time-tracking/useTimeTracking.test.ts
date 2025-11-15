
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import * as useActiveTimeEntryModule from '@/hooks/time-tracking/useActiveTimeEntry';
import * as useTimeEntryOperationsModule from '@/hooks/time-tracking/useTimeEntryOperations';

// Mock dependencies
vi.mock('@/hooks/time-tracking/useActiveTimeEntry');
vi.mock('@/hooks/time-tracking/useTimeEntryOperations');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useTimeTracking', () => {
  const mockActiveTimeEntry = {
    id: 'test-id',
    user_id: 'user-123',
    task_type: 'maintenance' as const,
    start_time: '2025-01-15T10:00:00Z',
    status: 'active' as const,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  };

  const mockRefreshActiveTimeEntry = vi.fn();
  const mockSetActiveTimeEntry = vi.fn();
  const mockStartOperation = vi.fn();
  const mockStopOperation = vi.fn();
  const mockPauseOperation = vi.fn();
  const mockResumeOperation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useActiveTimeEntry
    vi.mocked(useActiveTimeEntryModule.useActiveTimeEntry).mockReturnValue({
      activeTimeEntry: mockActiveTimeEntry,
      setActiveTimeEntry: mockSetActiveTimeEntry,
      isLoading: false,
      error: null,
      refreshActiveTimeEntry: mockRefreshActiveTimeEntry
    });

    // Mock useTimeEntryOperations
    vi.mocked(useTimeEntryOperationsModule.useTimeEntryOperations).mockReturnValue({
      startTimeEntry: mockStartOperation,
      stopTimeEntry: mockStopOperation,
      pauseTimeEntry: mockPauseOperation,
      resumeTimeEntry: mockResumeOperation
    });
  });

  it('should return active time entry data', () => {
    const { result } = renderHook(() => useTimeTracking());

    expect(result.current.activeTimeEntry).toEqual(mockActiveTimeEntry);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should start time entry successfully', async () => {
    const newEntry = { ...mockActiveTimeEntry, id: 'new-id' };
    mockStartOperation.mockResolvedValue(newEntry);

    const { result } = renderHook(() => useTimeTracking());

    await act(async () => {
      const entry = await result.current.startTimeEntry({
        task_type: 'maintenance',
        equipment_id: 1,
        location: 'Test Location'
      });
      expect(entry).toEqual(newEntry);
    });

    expect(mockStartOperation).toHaveBeenCalledWith({
      task_type: 'maintenance',
      equipment_id: 1,
      location: 'Test Location'
    });
    expect(mockRefreshActiveTimeEntry).toHaveBeenCalled();
  });

  it('should handle start time entry errors', async () => {
    const error = new Error('Failed to start');
    mockStartOperation.mockRejectedValue(error);

    const { result } = renderHook(() => useTimeTracking());

    await expect(
      act(async () => {
        await result.current.startTimeEntry({
          task_type: 'maintenance'
        });
      })
    ).rejects.toThrow('Failed to start');
  });

  it('should stop time entry successfully', async () => {
    mockStopOperation.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeTracking());

    await act(async () => {
      await result.current.stopTimeEntry('test-id');
    });

    expect(mockStopOperation).toHaveBeenCalledWith('test-id');
    expect(mockSetActiveTimeEntry).toHaveBeenCalledWith(null);
  });

  it('should handle stop time entry errors', async () => {
    const error = new Error('Failed to stop');
    mockStopOperation.mockRejectedValue(error);

    const { result } = renderHook(() => useTimeTracking());

    await expect(
      act(async () => {
        await result.current.stopTimeEntry('test-id');
      })
    ).rejects.toThrow('Failed to stop');
  });

  it('should pause time entry successfully', async () => {
    mockPauseOperation.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeTracking());

    await act(async () => {
      await result.current.pauseTimeEntry('test-id');
    });

    expect(mockPauseOperation).toHaveBeenCalledWith('test-id');
    expect(mockRefreshActiveTimeEntry).toHaveBeenCalled();
  });

  it('should handle pause time entry errors', async () => {
    const error = new Error('Failed to pause');
    mockPauseOperation.mockRejectedValue(error);

    const { result } = renderHook(() => useTimeTracking());

    await expect(
      act(async () => {
        await result.current.pauseTimeEntry('test-id');
      })
    ).rejects.toThrow('Failed to pause');
  });

  it('should resume time entry successfully', async () => {
    mockResumeOperation.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeTracking());

    await act(async () => {
      await result.current.resumeTimeEntry('test-id');
    });

    expect(mockResumeOperation).toHaveBeenCalledWith('test-id');
    expect(mockRefreshActiveTimeEntry).toHaveBeenCalled();
  });

  it('should handle resume time entry errors', async () => {
    const error = new Error('Failed to resume');
    mockResumeOperation.mockRejectedValue(error);

    const { result } = renderHook(() => useTimeTracking());

    await expect(
      act(async () => {
        await result.current.resumeTimeEntry('test-id');
      })
    ).rejects.toThrow('Failed to resume');
  });

  it('should refresh active time entry', async () => {
    const { result } = renderHook(() => useTimeTracking());

    await act(async () => {
      await result.current.refreshActiveTimeEntry();
    });

    expect(mockRefreshActiveTimeEntry).toHaveBeenCalled();
  });
});

