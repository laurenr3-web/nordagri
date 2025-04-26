
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PartCompatibility from '../PartCompatibility';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';

// Moquer le hook useEquipmentList
vi.mock('@/hooks/equipment/useEquipmentList', () => ({
  useEquipmentList: vi.fn()
}));

describe('PartCompatibility Component', () => {
  beforeEach(() => {
    // Réinitialiser les mocks entre les tests
    vi.resetAllMocks();
  });

  it('devrait afficher un message quand la liste est vide', () => {
    // Configurer le mock pour retourner une liste vide
    (useEquipmentList as unknown as vi.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    render(<PartCompatibility compatibility={[]} />);
    expect(screen.getByText('No compatible equipment found')).toBeInTheDocument();
  });

  it('devrait gérer les undefined/null correctement', () => {
    // Configurer le mock pour retourner une liste vide
    (useEquipmentList as unknown as vi.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    // @ts-ignore - Tester explicitement avec undefined
    render(<PartCompatibility compatibility={undefined} />);
    expect(screen.getByText('No compatible equipment found')).toBeInTheDocument();
  });

  it('devrait afficher le nom des équipements compatibles', () => {
    // Configurer le mock pour retourner des équipements
    (useEquipmentList as unknown as vi.Mock).mockReturnValue({
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
    // Configurer le mock pour simuler le chargement
    (useEquipmentList as unknown as vi.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    render(<PartCompatibility compatibility={[1, 2]} />);
    // Vérifier que les skeletons sont présents (on ne peut pas facilement tester le contenu exact)
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('devrait gérer les erreurs correctement', () => {
    // Configurer le mock pour simuler une erreur
    (useEquipmentList as unknown as vi.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Erreur de chargement')
    });

    render(<PartCompatibility compatibility={[1, 2]} />);
    expect(screen.getByText('Erreur lors du chargement des équipements compatibles')).toBeInTheDocument();
  });

  it('devrait filtrer les équipements non trouvés', () => {
    // Configurer le mock avec des équipements limités
    (useEquipmentList as unknown as vi.Mock).mockReturnValue({
      data: [
        { id: 1, name: 'Tracteur Fendt', model: '720 Vario' },
        // L'équipement avec l'ID 2 n'existe pas dans cette liste
      ],
      isLoading: false,
      error: null
    });

    // Recherche pour les IDs 1 et 2, mais seul 1 existe
    render(<PartCompatibility compatibility={[1, 2]} />);
    expect(screen.getByText('Tracteur Fendt')).toBeInTheDocument();
    // Vérifier qu'il n'y a qu'un seul badge
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
