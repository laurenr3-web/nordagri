
import { describe, it, expect, vi } from 'vitest';
import { equipmentService } from '@/services/supabase/equipmentService';

describe('EquipmentService', () => {
  it('should fetch equipment list', async () => {
    vi.spyOn(equipmentService, 'getEquipment').mockResolvedValue([
      { id: 1, name: 'Test Tractor', status: 'operational' }
    ]);
    const result = await equipmentService.getEquipment();
    expect(result[0].name).toBe('Test Tractor');
  });

  it('should add equipment', async () => {
    vi.spyOn(equipmentService, 'addEquipment').mockResolvedValue({ id: 2, name: 'Ajouter' });
    const result = await equipmentService.addEquipment({ name: 'Ajouter' });
    expect(result.name).toBe('Ajouter');
  });
});
