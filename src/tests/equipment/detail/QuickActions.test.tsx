import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import QuickActions from '@/components/equipment/detail/QuickActions';

const makeProps = () => ({
  onUpdateCounter: vi.fn(),
  onAddMaintenance: vi.fn(),
  onAddPoint: vi.fn(),
  onLinkPart: vi.fn(),
  onShowQR: vi.fn(),
  onShowFuel: vi.fn(),
  onShowPerformance: vi.fn(),
});

describe('QuickActions (équipement)', () => {
  it('rend toujours les 4 actions principales', () => {
    render(<QuickActions {...makeProps()} />);
    expect(screen.getByText('Actions rapides')).toBeTruthy();
    ['Compteur', 'Maintenance', 'Point', 'QR'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('cache les actions secondaires tant que "Plus d\'actions" n\'est pas ouvert', () => {
    render(<QuickActions {...makeProps()} />);
    expect(screen.queryByText('Pièce')).toBeNull();
    expect(screen.queryByText('Carburant')).toBeNull();
    expect(screen.queryByText('Performance')).toBeNull();
    fireEvent.click(screen.getByText("Plus d'actions"));
    expect(screen.getByText('Pièce')).toBeTruthy();
    expect(screen.getByText('Carburant')).toBeTruthy();
    expect(screen.getByText('Performance')).toBeTruthy();
  });

  it('déclenche les bons callbacks au clic', () => {
    const props = makeProps();
    render(<QuickActions {...props} />);
    fireEvent.click(screen.getByText('Compteur'));
    expect(props.onUpdateCounter).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Maintenance'));
    expect(props.onAddMaintenance).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Point'));
    expect(props.onAddPoint).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('QR'));
    expect(props.onShowQR).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Plus d'actions"));
    fireEvent.click(screen.getByText('Pièce'));
    expect(props.onLinkPart).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Carburant'));
    expect(props.onShowFuel).toHaveBeenCalledTimes(1);
  });
});