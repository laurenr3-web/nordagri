
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import 'vitest-dom/extend-expect';
import PartCompatibility from '../PartCompatibility';
import React from 'react';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';

// Mock the useEquipmentList hook
vi.mock('@/hooks/equipment/useEquipmentList', () => ({
  useEquipmentList: vi.fn()
}));

describe('PartCompatibility Component', () => {
  beforeEach(() => {
    // Default mock implementation
    (useEquipmentList as any).mockImplementation(() => ({
      data: [
        { id: 1, name: 'John Deere 6920' },
        { id: 2, name: 'New Holland T7.210' },
        { id: 3, name: 'Case IH Magnum' }
      ],
      isLoading: false
    }));
  });

  it('renders loading state', () => {
    (useEquipmentList as any).mockImplementation(() => ({
      data: null,
      isLoading: true
    }));

    render(<PartCompatibility compatibility={['1']} />);
    expect(screen.getByText('Chargement des équipements...')).toBeInTheDocument();
  });

  it('renders empty state when compatibility is undefined', () => {
    render(<PartCompatibility compatibility={undefined} />);
    expect(screen.getByText('Aucun équipement compatible enregistré')).toBeInTheDocument();
  });
  
  it('renders empty state when compatibility is an empty array', () => {
    render(<PartCompatibility compatibility={[]} />);
    expect(screen.getByText('Aucun équipement compatible enregistré')).toBeInTheDocument();
  });
  
  it('renders equipment names for valid IDs', () => {
    render(<PartCompatibility compatibility={['1', '2']} />);
    
    expect(screen.getByText('John Deere 6920')).toBeInTheDocument();
    expect(screen.getByText('New Holland T7.210')).toBeInTheDocument();
  });
  
  it('filters out invalid equipment IDs', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<PartCompatibility compatibility={['1', '999']} />);
    
    expect(screen.getByText('John Deere 6920')).toBeInTheDocument();
    expect(screen.queryByText('999')).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Equipment ID 999 not found in database');
    
    consoleSpy.mockRestore();
  });
});
