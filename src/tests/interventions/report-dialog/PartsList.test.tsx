
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { PartsList } from '@/components/interventions/dialogs/report-dialog/form-fields/PartsList';

describe('PartsList Component', () => {
  it('displays empty state when no parts provided', () => {
    render(
      <PartsList 
        parts={[]} 
        onRemovePart={vi.fn()} 
        onUpdateQuantity={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Aucune pièce utilisée')).toBeTruthy();
  });
  
  it('renders parts list correctly', () => {
    const mockParts = [
      { id: 1, name: 'Filtre à huile', quantity: 1 },
      { id: 2, name: 'Filtre à air', quantity: 2 }
    ];
    
    render(
      <PartsList 
        parts={mockParts} 
        onRemovePart={vi.fn()} 
        onUpdateQuantity={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Filtre à huile')).toBeTruthy();
    expect(screen.getByText('Filtre à air')).toBeTruthy();
    
    // Vérification des inputs de quantité
    const quantityInputs = screen.getAllByRole('spinbutton');
    expect(quantityInputs.length).toBe(2);
    expect(quantityInputs[0].getAttribute('value')).toBe('1');
    expect(quantityInputs[1].getAttribute('value')).toBe('2');
  });
  
  it('calls onRemovePart when removal button is clicked', () => {
    const mockRemove = vi.fn();
    
    render(
      <PartsList 
        parts={[{ id: 1, name: 'Filtre à huile', quantity: 1 }]} 
        onRemovePart={mockRemove} 
        onUpdateQuantity={vi.fn()} 
      />
    );
    
    // Clic sur le bouton de suppression
    const removeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(removeButton);
    
    expect(mockRemove).toHaveBeenCalledWith(1);
  });
  
  it('calls onUpdateQuantity when quantity is changed', () => {
    const mockUpdate = vi.fn();
    
    render(
      <PartsList 
        parts={[{ id: 1, name: 'Filtre à huile', quantity: 1 }]} 
        onRemovePart={vi.fn()} 
        onUpdateQuantity={mockUpdate} 
      />
    );
    
    // Modification de la quantité
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '3' } });
    
    expect(mockUpdate).toHaveBeenCalledWith(1, 3);
  });
});
