
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getEquipment, 
  getEquipmentById, 
  searchEquipment 
} from '@/services/supabase/equipment/queries';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('Equipment Queries', () => {
  // Setup mock response data
  const mockEquipmentData = [
    { id: 1, name: 'Tractor A', status: 'operational' },
    { id: 2, name: 'Harvester B', status: 'maintenance' }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup default mock implementation for supabase.from().select()
    const mockSelect = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        data: mockEquipmentData,
        error: null
      })
    });
    
    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect
    });
    
    vi.mocked(supabase.from).mockImplementation(mockFrom);
  });

  describe('getEquipment', () => {
    it('should fetch equipment with no filters', async () => {
      const result = await getEquipment();
      
      expect(supabase.from).toHaveBeenCalledWith('equipment');
      expect(result).toEqual(mockEquipmentData);
    });

    it('should apply filters when provided', async () => {
      // Setup mock for filtered queries
      const mockOr = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          data: [mockEquipmentData[0]],
          error: null
        })
      });
      
      const mockEq = vi.fn().mockReturnValue({
        or: mockOr
      });
      
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);
      
      const filter = {
        search: 'Tractor',
        status: ['operational']
      };
      
      const result = await getEquipment(filter);
      
      expect(supabase.from).toHaveBeenCalledWith('equipment');
      expect(result).toEqual([mockEquipmentData[0]]);
    });

    it('should handle errors', async () => {
      // Setup mock to return an error
      const mockOrder = vi.fn().mockReturnValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);
      
      await expect(getEquipment()).rejects.toEqual({ message: 'Database error' });
    });
  });

  describe('getEquipmentById', () => {
    it('should fetch a single equipment by ID', async () => {
      // Setup mock for single item query
      const mockSingle = vi.fn().mockReturnValue({
        data: mockEquipmentData[0],
        error: null
      });
      
      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);
      
      const result = await getEquipmentById(1);
      
      expect(supabase.from).toHaveBeenCalledWith('equipment');
      expect(result).toEqual(mockEquipmentData[0]);
    });

    it('should return null for non-existent equipment', async () => {
      // Setup mock for "not found" response
      const mockSingle = vi.fn().mockReturnValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      
      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle
      });
      
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);
      
      const result = await getEquipmentById(999);
      
      expect(result).toBeNull();
    });
  });

  describe('searchEquipment', () => {
    it('should search equipment by search term', async () => {
      // Setup mock for search query
      const mockOrder = vi.fn().mockReturnValue({
        data: [mockEquipmentData[0]],
        error: null
      });
      
      const mockOr = vi.fn().mockReturnValue({
        order: mockOrder
      });
      
      const mockSelect = vi.fn().mockReturnValue({
        or: mockOr
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);
      
      const result = await searchEquipment('Tractor');
      
      expect(supabase.from).toHaveBeenCalledWith('equipment');
      expect(result).toEqual([mockEquipmentData[0]]);
    });
  });
});
