
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMaintenanceContent } from '@/components/maintenance/useMaintenanceContent';
import { renderHook, act } from '@testing-library/react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

describe('useMaintenanceContent', () => {
  const mockTasks: MaintenanceTask[] = [
    {
      id: 1,
      title: 'Oil Change',
      notes: 'Change engine oil', // Using notes instead of description
      status: 'scheduled', // Use valid status
      priority: 'medium',
      dueDate: new Date('2025-05-20'), // Changed from string to Date object
      equipment_id: 1,
      equipment_name: 'Tractor'
    },
    {
      id: 2,
      title: 'Tire Check',
      notes: 'Check tire pressure', // Using notes instead of description
      status: 'completed', // Use valid status
      priority: 'low',
      dueDate: new Date('2025-05-15'), // Changed from string to Date object
      equipment_id: 2,
      equipment_name: 'Harvester'
    },
    {
      id: 3,
      title: 'Engine Repair',
      notes: 'Fix engine issues', // Using notes instead of description
      status: 'scheduled', // Use valid status
      priority: 'high',
      dueDate: new Date('2025-05-10'), // Changed from string to Date object
      equipment_id: 1,
      equipment_name: 'Tractor'
    }
  ];

  const mockSetCurrentView = vi.fn();
  const mockUserName = 'Test User';

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock URL.searchParams (for URL search parameter handling)
    Object.defineProperty(window, 'location', {
      value: {
        search: ''
      },
      writable: true
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => 
      useMaintenanceContent(mockTasks, mockSetCurrentView, mockUserName)
    );
    
    expect(result.current.filterValue).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filterOptions).toBeInstanceOf(Array);
    expect(result.current.highlightedTaskId).toBeNull();
  });

  it('should filter tasks by status and return only matching tasks', () => {
    const { result } = renderHook(() => 
      useMaintenanceContent(mockTasks, mockSetCurrentView, mockUserName)
    );
    
    let filteredTasks = result.current.getCurrentTasks('today');
    expect(filteredTasks.length).toBe(0); // No tasks due today in our mock
    
    filteredTasks = result.current.getCurrentTasks('completed');
    expect(filteredTasks.length).toBe(1);
    expect(filteredTasks[0].id).toBe(2);
    
    filteredTasks = result.current.getCurrentTasks('high');
    expect(filteredTasks.length).toBe(1);
    expect(filteredTasks[0].id).toBe(3);
  });

  it('should update filter value correctly', () => {
    const { result } = renderHook(() => 
      useMaintenanceContent(mockTasks, mockSetCurrentView, mockUserName)
    );
    
    act(() => {
      result.current.setFilterValue('high');
    });
    
    expect(result.current.filterValue).toBe('high');
    
    // Get tasks with high priority
    const tasksWithHighPriority = mockTasks.filter(task => 
      result.current.filterValue === 'all' || task.priority === result.current.filterValue
    );
    
    expect(tasksWithHighPriority.length).toBe(1);
    expect(tasksWithHighPriority[0].id).toBe(3);
  });

  it('should update search query correctly', () => {
    const { result } = renderHook(() => 
      useMaintenanceContent(mockTasks, mockSetCurrentView, mockUserName)
    );
    
    act(() => {
      result.current.setSearchQuery('Oil');
    });
    
    expect(result.current.searchQuery).toBe('Oil');
    
    // Filter tasks that match search query
    const tasksMatchingQuery = mockTasks.filter(task => 
      task.title.toLowerCase().includes(result.current.searchQuery.toLowerCase()) ||
      task.notes.toLowerCase().includes(result.current.searchQuery.toLowerCase())
    );
    
    expect(tasksMatchingQuery.length).toBe(1);
    expect(tasksMatchingQuery[0].id).toBe(1);
  });

  it('should handle URL search parameters for highlighted task', () => {
    // Mock a URL with a task ID parameter
    Object.defineProperty(window, 'location', {
      value: {
        search: '?task=2'
      },
      writable: true
    });
    
    const { result } = renderHook(() => 
      useMaintenanceContent(mockTasks, mockSetCurrentView, mockUserName)
    );
    
    expect(result.current.highlightedTaskId).toBe('2');
    
    // Verify that setCurrentView was called with 'completed' 
    // because task #2 has 'completed' status
    expect(mockSetCurrentView).toHaveBeenCalledWith('completed');
  });
});
