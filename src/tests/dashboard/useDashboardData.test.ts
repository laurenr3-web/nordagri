
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
      statsData: [{ label: 'Total Equipment', value: 5 }]
    });
    
    vi.mocked(useEquipmentData).mockReturnValue({
      loading: false,
      equipmentData: [{ id: 1, name: 'Tractor', status: 'operational' }],
      fetchEquipment: vi.fn()
    });
    
    vi.mocked(useMaintenanceData).mockReturnValue({
      maintenanceEvents: [{ id: 1, title: 'Oil Change', date: '2025-05-20' }]
    });
    
    vi.mocked(useAlertsData).mockReturnValue({
      alertItems: [{ id: 1, message: 'Maintenance overdue', type: 'warning' }]
    });
    
    vi.mocked(useTasksData).mockReturnValue({
      upcomingTasks: [{ id: 1, title: 'Check tires', dueDate: '2025-05-25' }]
    });
    
    vi.mocked(useInterventionsData).mockReturnValue({
      interventions: [{ id: '1', title: 'Field repair', status: 'pending' }],
      isLoading: false,
      filters: {}
    });
    
    vi.mocked(usePartsData).mockReturnValue({
      data: [{ id: 1, name: 'Air filter', stock: 5 }],
      isLoading: false
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
    vi.mocked(useMaintenanceData).mockReturnValue({ maintenanceEvents: [] });
    vi.mocked(useAlertsData).mockReturnValue({ alertItems: [] });
    vi.mocked(useTasksData).mockReturnValue({ upcomingTasks: [] });
    vi.mocked(useInterventionsData).mockReturnValue({
      interventions: [],
      isLoading: false,
      filters: {}
    });
    vi.mocked(usePartsData).mockReturnValue({
      data: [],
      isLoading: false
    });
    
    const { result } = renderHook(() => useDashboardData());
    
    expect(result.current.urgentInterventions).toEqual([]);
    expect(result.current.stockAlerts).toEqual([]);
    expect(result.current.weeklyCalendarEvents).toEqual([]);
  });
});
