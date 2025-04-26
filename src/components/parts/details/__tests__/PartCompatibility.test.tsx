
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PartCompatibility from '../PartCompatibility';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';

// Mock the useEquipmentList hook
vi.mock('@/hooks/equipment/useEquipmentList', () => ({
  useEquipmentList: vi.fn()
}));

describe('PartCompatibility Component', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.resetAllMocks();
  });

  it('devrait afficher un message quand la liste est vide', () => {
    // Configure the mock to return an empty list
    (useEquipmentList as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    render(<PartCompatibility compatibility={[]} />);
    expect(screen.getByText('No compatible equipment found')).toBeInTheDocument();
  });

  it('devrait gérer les undefined/null correctement', () => {
    // Configure the mock to return an empty list
    (useEquipmentList as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    // @ts-ignore - Explicitly test with undefined
    render(<PartCompatibility compatibility={undefined} />);
    expect(screen.getByText('No compatible equipment found')).toBeInTheDocument();
  });

  it('devrait afficher le nom des équipements compatibles', () => {
    // Configure the mock to return equipment
    (useEquipmentList as any).mockReturnValue({
      data: [
        { id: 1, name: 'Tracteur Fendt', model: '720 Vario' },
        { id: 2, name: 'Moissonneuse Case', model: 'IH 8250' }
      ],
      isLoading: false,
      error: null
    });

    render(<PartCompatibility compatibility={[1, 2]} />);
    expect(screen.getByText('Tracteur Fendt')).toBeInTheDocument();
    expect(screen.getByText('Moissonneuse Case')).toBeInTheDocument();
  });

  it('devrait afficher un indicateur de chargement', () => {
    // Configure the mock to simulate loading
    (useEquipmentList as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    render(<PartCompatibility compatibility={[1, 2]} />);
    // Check that skeletons are present (can't easily test exact content)
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('devrait gérer les erreurs correctement', () => {
    // Configure the mock to simulate an error
    (useEquipmentList as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Erreur de chargement')
    });

    render(<PartCompatibility compatibility={[1, 2]} />);
    expect(screen.getByText('Erreur lors du chargement des équipements compatibles')).toBeInTheDocument();
  });

  it('devrait filtrer les équipements non trouvés', () => {
    // Configure the mock with limited equipment
    (useEquipmentList as any).mockReturnValue({
      data: [
        { id: 1, name: 'Tracteur Fendt', model: '720 Vario' },
        // Equipment with ID 2 doesn't exist in this list
      ],
      isLoading: false,
      error: null
    });

    // Search for IDs 1 and 2, but only 1 exists
    render(<PartCompatibility compatibility={[1, 2]} />);
    expect(screen.getByText('Tracteur Fendt')).toBeInTheDocument();
    // Check that there is only one badge
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
