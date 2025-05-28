
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { DialogFooterActions } from '@/components/interventions/dialogs/report-dialog/DialogFooterActions';

describe('DialogFooterActions Component', () => {
  it('renders buttons correctly', () => {
    // Création de mocks pour les fonctions
    const mockCancel = vi.fn();
    const mockExportPDF = vi.fn();
    const mockSubmit = vi.fn();
    
    render(
      <DialogFooterActions 
        onCancel={mockCancel} 
        onExportPDF={mockExportPDF} 
        onSubmit={mockSubmit} 
      />
    );
    
    // Vérification de la présence des boutons
    expect(screen.getByText('Annuler')).toBeTruthy();
    expect(screen.getByText('Exporter PDF')).toBeTruthy();
    expect(screen.getByText('Valider l\'intervention')).toBeTruthy();
  });
  
  it('calls the appropriate functions when buttons are clicked', () => {
    // Création de mocks pour les fonctions
    const mockCancel = vi.fn();
    const mockExportPDF = vi.fn();
    const mockSubmit = vi.fn();
    
    render(
      <DialogFooterActions 
        onCancel={mockCancel} 
        onExportPDF={mockExportPDF} 
        onSubmit={mockSubmit} 
      />
    );
    
    // Simulation des clics
    fireEvent.click(screen.getByText('Annuler'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText('Exporter PDF'));
    expect(mockExportPDF).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText('Valider l\'intervention'));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
