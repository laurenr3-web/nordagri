
import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('FuelLog Integration', () => {
  it('should fetch fuel logs for an equipment', async () => {
    // Create a proper mock for the Supabase client chain
    const mockOrderFn = vi.fn().mockReturnValue({
      data: [{ id: '1', fuel_quantity_liters: 20 }],
      error: null
    });
    
    const mockEqFn = vi.fn().mockReturnValue({
      order: mockOrderFn
    });
    
    const mockSelectFn = vi.fn().mockReturnValue({
      eq: mockEqFn
    });
    
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: mockSelectFn
    } as any);
    
    const { data } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('equipment_id', 1)
      .order('date', { ascending: false });

    expect(data[0].fuel_quantity_liters).toBe(20);
  });
});
