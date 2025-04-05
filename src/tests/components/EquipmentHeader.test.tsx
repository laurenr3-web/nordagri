import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EquipmentHeader from '@/components/equipment/display/EquipmentHeader';

describe('EquipmentHeader Component', () => {
  it('renders the header with correct title', () => {
    const mockOpenAddDialog = vi.fn();
    render(<EquipmentHeader openAddDialog={mockOpenAddDialog} />);
    
    // Vérifier que le titre est affiché
    expect(screen.getByText('Équipements')).toBeInTheDocument();
  });
  
  it('renders the subtitle text', () => {
    const mockOpenAddDialog = vi.fn();
    render(<EquipmentHeader openAddDialog={mockOpenAddDialog} />);
    
    // Vérifier que le sous-titre est affiché
    expect(screen.getByText('Gérez votre flotte d\'équipements et matériels agricoles')).toBeInTheDocument();
  });
  
  it('calls openAddDialog when button is clicked', () => {
    const mockOpenAddDialog = vi.fn();
    render(<EquipmentHeader openAddDialog={mockOpenAddDialog} />);
    
    // Trouver le bouton et simuler un clic
    const addButton = screen.getByText(/Ajouter un équipement/i);
    fireEvent.click(addButton);
    
    // Vérifier que la fonction a été appelée
    expect(mockOpenAddDialog).toHaveBeenCalledTimes(1);
  });
});
