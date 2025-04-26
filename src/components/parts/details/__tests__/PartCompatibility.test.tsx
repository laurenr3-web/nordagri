
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PartCompatibility from '../PartCompatibility';
import React from 'react';

describe('PartCompatibility Component', () => {
  it('renders empty state when compatibility is undefined', () => {
    render(<PartCompatibility compatibility={undefined} />);
    
    expect(screen.getByText('Aucune information de compatibilité disponible')).toBeInTheDocument();
  });
  
  it('renders empty state when compatibility is an empty array', () => {
    render(<PartCompatibility compatibility={[]} />);
    
    expect(screen.getByText('Aucune information de compatibilité disponible')).toBeInTheDocument();
  });
  
  it('renders badges for each compatibility item', () => {
    const compatibilityItems = ['John Deere 6920', 'New Holland T7.210', 'Case IH Magnum'];
    render(<PartCompatibility compatibility={compatibilityItems} />);
    
    compatibilityItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });
  
  it('handles type errors gracefully', () => {
    // Simulate a situation where compatibility has wrong type
    // @ts-ignore - Intentionally passing wrong type for testing
    render(<PartCompatibility compatibility={'Invalid data type'} />);
    
    // Should show empty state when data is invalid
    expect(screen.getByText('Aucune information de compatibilité disponible')).toBeInTheDocument();
  });
});

