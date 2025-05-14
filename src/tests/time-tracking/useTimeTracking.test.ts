
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { useActiveTimeEntry } from '@/hooks/time-tracking/useActiveTimeEntry';
import { useTimeEntryOperations } from '@/hooks/time-tracking/useTimeEntryOperations';
import { renderHook, act } from '@testing-library/react';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';

// Mock the dependent hooks
vi.mock('@/hooks/time-tracking/useActiveTimeEntry');
vi.mock('@/hooks/time-tracking/useTimeEntryOperations');

describe('useTimeTracking', () => {
  const mockActiveTimeEntry = {
    id: 'entry-1',
    user_id: 'user-1',
    task_type: 'maintenance' as TimeEntryTaskType,
    start_time: '2025-05-12T10:00:00Z',
    status: 'active' as const, // Using 'as const' to specify that this is a literal type
    created_at: '2025-05-12T10:00:00Z',
    updated_at: '2025-05-12T10:00:00Z'
  };

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Setup default mock implementations
    vi.mocked(useActiveTimeEntry).mockReturnValue({
      activeTimeEntry: mockActiveTimeEntry,
      setActiveTimeEntry: vi.fn(),
      isLoading: false,
      error: null,
      refreshActiveTimeEntry: vi.fn().mockResolvedValue(undefined)
    });
    
    vi.mocked(useTimeEntryOperations).mockReturnValue({
      startTimeEntry: vi.fn().mockResolvedValue({ id: 'new-entry-1' }),
      stopTimeEntry: vi.fn().mockResolvedValue(undefined),
      pauseTimeEntry: vi.fn().mockResolvedValue(undefined),
      resumeTimeEntry: vi.fn().mockResolvedValue(undefined)
    });
  });

  it('should return activeTimeEntry from useActiveTimeEntry', () => {
    const { result } = renderHook(() => useTimeTracking());
    
    expect(result.current.activeTimeEntry).toEqual(mockActiveTimeEntry);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call startTimeEntry and refreshActiveTimeEntry when startTimeEntry is called', async () => {
    const { result } = renderHook(() => useTimeTracking());
    
    const startParams = { task_type: 'repair' as TimeEntryTaskType };
    
    await act(async () => {
      await result.current.startTimeEntry(startParams);
    });
    
    const startTimeEntryMock = vi.mocked(useTimeEntryOperations().startTimeEntry);
    const refreshActiveTimeEntryMock = vi.mocked(useActiveTimeEntry().refreshActiveTimeEntry);
    
    expect(startTimeEntryMock).toHaveBeenCalledWith(startParams);
    expect(refreshActiveTimeEntryMock).toHaveBeenCalledTimes(1);
  });

  it('should call stopTimeEntry and update active entry when stopTimeEntry is called', async () => {
    const setActiveTimeEntryMock = vi.fn();
    vi.mocked(useActiveTimeEntry).mockReturnValue({
      activeTimeEntry: mockActiveTimeEntry,
      setActiveTimeEntry: setActiveTimeEntryMock,
      isLoading: false,
      error: null,
      refreshActiveTimeEntry: vi.fn().mockResolvedValue(undefined)
    });
    
    const { result } = renderHook(() => useTimeTracking());
    
    await act(async () => {
      await result.current.stopTimeEntry('entry-1');
    });
    
    const stopTimeEntryMock = vi.mocked(useTimeEntryOperations().stopTimeEntry);
    
    expect(stopTimeEntryMock).toHaveBeenCalledWith('entry-1');
    expect(setActiveTimeEntryMock).toHaveBeenCalledWith(null);
  });

  it('should call pauseTimeEntry and refreshActiveTimeEntry when pauseTimeEntry is called', async () => {
    const { result } = renderHook(() => useTimeTracking());
    
    await act(async () => {
      await result.current.pauseTimeEntry('entry-1');
    });
    
    const pauseTimeEntryMock = vi.mocked(useTimeEntryOperations().pauseTimeEntry);
    const refreshActiveTimeEntryMock = vi.mocked(useActiveTimeEntry().refreshActiveTimeEntry);
    
    expect(pauseTimeEntryMock).toHaveBeenCalledWith('entry-1');
    expect(refreshActiveTimeEntryMock).toHaveBeenCalledTimes(1);
  });

  it('should call resumeTimeEntry and refreshActiveTimeEntry when resumeTimeEntry is called', async () => {
    const { result } = renderHook(() => useTimeTracking());
    
    await act(async () => {
      await result.current.resumeTimeEntry('entry-1');
    });
    
    const resumeTimeEntryMock = vi.mocked(useTimeEntryOperations().resumeTimeEntry);
    const refreshActiveTimeEntryMock = vi.mocked(useActiveTimeEntry().refreshActiveTimeEntry);
    
    expect(resumeTimeEntryMock).toHaveBeenCalledWith('entry-1');
    expect(refreshActiveTimeEntryMock).toHaveBeenCalledTimes(1);
  });
});
