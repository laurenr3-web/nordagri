
import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('FuelLog Integration', () => {
  it('should fetch fuel logs for an equipment', async () => {
    vi.spyOn(supabase.from('fuel_logs'), 'select').mockReturnValue({
      eq: () => ({
        order: () => ({
          data: [{ id: '1', fuel_quantity_liters: 20 }],
          error: null
        })
      })
    });
    const { data } = await supabase
      .from('fuel_logs')
      .select('*')
      .eq('equipment_id', 1)
      .order('date', { ascending: false });

    expect(data[0].fuel_quantity_liters).toBe(20);
  });
});
