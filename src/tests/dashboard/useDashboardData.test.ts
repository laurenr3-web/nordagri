
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useStatsData } from '@/hooks/dashboard/useStatsData';
import { useEquipmentData } from '@/hooks/dashboard/useEquipmentData';
import { useMaintenanceData } from '@/hooks/dashboard/useMaintenanceData';
import { useAlertsData } from '@/hooks/dashboard/useAlertsData';
import { useTasksData } from '@/hooks/dashboard/useTasksData';
import { renderHook, waitFor } from '@testing-library/react';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { usePartsData } from '@/hooks/parts/usePartsData';
import { StatsCardData, EquipmentItem, MaintenanceEvent, AlertItem, UpcomingTask } from '@/hooks/dashboard/types/dashboardTypes';

// Mock all imported hooks
vi.mock('@/hooks/dashboard/useStatsData');
vi.mock('@/hooks/dashboard/useEquipmentData');
vi.mock('@/hooks/dashboard/useMaintenanceData');
vi.mock('@/hooks/dashboard/useAlertsData');
vi.mock('@/hooks/dashboard/useTasksData');
vi.mock('@/hooks/interventions/useInterventionsData');
vi.mock('@/hooks/parts/usePartsData');
vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: () => ({ user: { id: 'test-user' } })
}));

describe('useDashboardData', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Setup default mock implementations
    vi.mocked(useStatsData).mockReturnValue({
      statsData: [{ title: 'Total Equipment', value: 5 }] as StatsCardData[]
    });
    
    vi.mocked(useEquipmentData).mockReturnValue({
      loading: false,
      equipmentData: [{ id: 1, name: 'Tractor', type: 'tractor', status: 'operational' }] as EquipmentItem[],
      fetchEquipment: vi.fn()
    });
    
    vi.mocked(useMaintenanceData).mockReturnValue({
      loading: false,
      maintenanceEvents: [{ 
        id: 1, 
        title: 'Oil Change', 
        date: new Date('2025-05-20'),
        equipment: 'Tractor',
        status: 'scheduled',
        priority: 'medium',
        assignedTo: 'John Doe',
        duration: 60
      }] as MaintenanceEvent[],
      error: '',
      refresh: vi.fn().mockResolvedValue(undefined)
    });
    
    vi.mocked(useAlertsData).mockReturnValue({
      loading: false,
      alertItems: [{
        id: 1,
        title: 'Maintenance Alert',
        message: 'Maintenance overdue',
        severity: 'high',
        date: new Date(),
        equipmentId: 1,
        equipmentName: 'Tractor',
        status: 'new',
        type: 'maintenance',
        time: '10:00',
        equipment: 'Tractor'
      }] as AlertItem[]
    });
    
    vi.mocked(useTasksData).mockReturnValue({
      loading: false,
      upcomingTasks: [{
        id: 1,
        title: 'Check tires',
        description: 'Check tire pressure',
        dueDate: new Date('2025-05-25'),
        status: 'scheduled',
        priority: 'medium',
        assignedTo: 'John Doe'
      }] as UpcomingTask[]
    });
    
    vi.mocked(useInterventionsData).mockReturnValue({
      interventions: [{ 
        id: '1', 
        title: 'Field repair', 
        status: 'pending',
        equipment: 'Tractor',
        priority: 'high',
        date: new Date(),
        technician: 'John Doe',
        location: 'Field 1'
      }],
      isLoading: false,
      createIntervention: vi.fn(),
      updateInterventionStatus: vi.fn(),
      assignTechnician: vi.fn(),
      submitReport: vi.fn()
    });
    
    vi.mocked(usePartsData).mockReturnValue({
      data: [{ 
        id: 1, 
        name: 'Air filter', 
        partNumber: 'AF001',
        category: 'Filters',
        compatibility: [1, 2],
        manufacturer: 'FilterCo',
        stock: 5,
        reorderPoint: 2,
        price: 19.99,
        location: 'Shelf A'
      }],
      isLoading: false,
      error: null,
      status: 'success',
      fetchStatus: 'idle',
      isSuccess: true,
      isPending: false,
      isError: false,
      refetch: vi.fn()
    });
  });

  it('should aggregate data from multiple hooks', async () => {
    const { result } = renderHook(() => useDashboardData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.statsData).toHaveLength(1);
    expect(result.current.equipmentData).toHaveLength(1);
    expect(result.current.maintenanceEvents).toHaveLength(1);
    expect(result.current.alertItems).toHaveLength(1);
    expect(result.current.upcomingTasks).toHaveLength(1);
    expect(result.current.urgentInterventions).toBeDefined();
    expect(result.current.stockAlerts).toBeDefined();
  });

  it('should set loading to false when data is available', async () => {
    const { result } = renderHook(() => useDashboardData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle empty data gracefully', async () => {
    // Mock hooks to return empty arrays
    vi.mocked(useStatsData).mockReturnValue({ statsData: [] });
    vi.mocked(useEquipmentData).mockReturnValue({
      loading: false, 
      equipmentData: [],
      fetchEquipment: vi.fn()
    });
    vi.mocked(useMaintenanceData).mockReturnValue({
      loading: false,
      maintenanceEvents: [],
      error: '',
      refresh: vi.fn().mockResolvedValue(undefined)
    });
    vi.mocked(useAlertsData).mockReturnValue({
      loading: false,
      alertItems: []
    });
    vi.mocked(useTasksData).mockReturnValue({
      loading: false,
      upcomingTasks: []
    });
    vi.mocked(useInterventionsData).mockReturnValue({
      interventions: [],
      isLoading: false,
      createIntervention: vi.fn(),
      updateInterventionStatus: vi.fn(),
      assignTechnician: vi.fn(),
      submitReport: vi.fn()
    });
    vi.mocked(usePartsData).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      status: 'success',
      fetchStatus: 'idle',
      isSuccess: true,
      isPending: false,
      isError: false,
      refetch: vi.fn()
    });
    
    const { result } = renderHook(() => useDashboardData());
    
    expect(result.current.urgentInterventions).toEqual([]);
    expect(result.current.stockAlerts).toEqual([]);
    expect(result.current.weeklyCalendarEvents).toEqual([]);
  });
});
