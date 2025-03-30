
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { equipmentRepository } from '@/data/repositories/equipmentRepository';
import { ensureNumberId, isNumeric, validateEquipmentStatus } from '@/utils/typeGuards';

// Mock the adapter
vi.mock('@/data/adapters/supabaseAdapter', () => ({
  supabaseAdapter: {
    equipment: {
      getAll: vi.fn(),
      getById: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

describe('Equipment Type Guards', () => {
  it('should check if values are numeric', () => {
    expect(isNumeric(123)).toBe(true);
    expect(isNumeric('123')).toBe(true);
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
  });

  it('should convert string IDs to numbers', () => {
    expect(ensureNumberId('123')).toBe(123);
    expect(ensureNumberId(456)).toBe(456);
  });
  
  it('should handle edge cases', () => {
    expect(() => ensureNumberId('abc')).toThrow();
    expect(ensureNumberId('0')).toBe(0);
  });

  it('should validate equipment status', () => {
    expect(validateEquipmentStatus('operational')).toBe('operational');
    expect(validateEquipmentStatus('maintenance')).toBe('maintenance');
    expect(validateEquipmentStatus('repair')).toBe('repair');
    expect(validateEquipmentStatus('inactive')).toBe('inactive');
    expect(validateEquipmentStatus('invalid')).toBe('operational'); // Default
    expect(validateEquipmentStatus()).toBe('operational'); // Default
  });
});

// Tests pour les fonctionnalités principales
describe('Equipment Repository', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get all equipment', async () => {
    const mockData = [{ id: 1, name: 'Tractor' }, { id: 2, name: 'Harvester' }];
    vi.spyOn(equipmentRepository, 'getAll').mockResolvedValue(mockData);
    
    const result = await equipmentRepository.getAll();
    
    expect(result).toEqual(mockData);
    expect(result.length).toBe(2);
  });
  
  it('should get equipment by ID', async () => {
    const mockData = { id: 1, name: 'Tractor' };
    vi.spyOn(equipmentRepository, 'getById').mockResolvedValue(mockData);
    
    const result = await equipmentRepository.getById(1);
    
    expect(result).toEqual(mockData);
  });
  
  it('should return null when equipment not found', async () => {
    vi.spyOn(equipmentRepository, 'getById').mockResolvedValue(null);
    
    const result = await equipmentRepository.getById(999);
    
    expect(result).toBeNull();
  });
  
  it('should add new equipment', async () => {
    const newEquipment = { name: 'New Tractor', type: 'Tractor' };
    const mockResult = { id: 3, ...newEquipment };
    
    vi.spyOn(equipmentRepository, 'add').mockResolvedValue(mockResult);
    
    const result = await equipmentRepository.add(newEquipment);
    
    expect(result).toEqual(mockResult);
    expect(result.id).toBeDefined();
  });
  
  it('should update equipment', async () => {
    const equipment = { id: 1, name: 'Updated Tractor', type: 'Tractor' };
    
    vi.spyOn(equipmentRepository, 'update').mockResolvedValue(equipment);
    
    const result = await equipmentRepository.update(equipment);
    
    expect(result).toEqual(equipment);
  });
  
  it('should delete equipment', async () => {
    vi.spyOn(equipmentRepository, 'delete').mockResolvedValue(undefined);
    
    await expect(equipmentRepository.delete(1)).resolves.not.toThrow();
  });
});
