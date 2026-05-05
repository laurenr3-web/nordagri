import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';

vi.mock('@/components/maintenance/dialogs/MaintenanceTaskDetailDialog', () => ({ default: () => null }));
vi.mock('@/components/points/PointDetailDialog', () => ({ PointDetailDialog: () => null }));

const snapshotMock = vi.fn();
vi.mock('@/components/equipment/detail/useEquipmentSnapshot', () => ({
  useEquipmentSnapshot: (...args: any[]) => snapshotMock(...args),
  equipmentSnapshotKey: () => ['equipment-snapshot'],
}));

import PriorityActionCard from '@/components/equipment/detail/PriorityActionCard';

const equipment = { id: 1, name: 'Tracteur', valeur_actuelle: 0 } as any;
const baseSnap = {
  tasks: [], points: [],
  overdueTasks: [], upcomingTasks: [], completedTasks: [],
  activePoints: [], criticalPoints: [], importantPoints: [],
  lastActivity: null,
};

describe('PriorityActionCard — accessibilité', () => {
  it('expose une région étiquetée par le titre de la carte', () => {
    snapshotMock.mockReturnValue(baseSnap);
    render(<PriorityActionCard equipment={equipment} />);
    const region = screen.getByRole('region', { name: /À faire sur cette machine/i });
    expect(region).toBeTruthy();
  });

  it('annonce l\'état vide via role="status" aria-live', () => {
    snapshotMock.mockReturnValue(baseSnap);
    render(<PriorityActionCard equipment={equipment} />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toMatch(/Rien à faire/i);
  });

  it('groupe les badges de compteurs avec un aria-label lisible', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      overdueTasks: [{ id: 1, title: 'Vidange', dueDate: new Date(Date.now() - 86400000).toISOString() }],
      criticalPoints: [{ id: 'p1', title: 'Fuite' }],
      importantPoints: [{ id: 'p2', title: 'Bruit' }],
    });
    render(<PriorityActionCard equipment={equipment} />);
    const group = screen.getByRole('group', { name: /Résumé des éléments par priorité/i });
    expect(group).toBeTruthy();
    expect(group.textContent).toMatch(/1 en retard/);
    expect(group.textContent).toMatch(/1 critique/);
    expect(group.textContent).toMatch(/1 important/);
  });

  it('rend une liste accessible avec un aria-label décrivant le nombre d\'éléments', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      overdueTasks: [
        { id: 1, title: 'Vidange', dueDate: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, title: 'Filtre', dueDate: new Date(Date.now() - 2 * 86400000).toISOString() },
      ],
    });
    render(<PriorityActionCard equipment={equipment} />);
    const list = screen.getByRole('list', { name: /Liste des 2 éléments/i });
    expect(list).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('chaque ligne est un bouton type="button" focusable avec un aria-label complet', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      overdueTasks: [{ id: 1, title: 'Vidange', dueDate: new Date(Date.now() - 86400000).toISOString() }],
    });
    render(<PriorityActionCard equipment={equipment} />);
    const btn = screen.getByRole('button', {
      name: /Maintenance en retard\s*:\s*Vidange.*Ouvrir le détail/i,
    }) as HTMLButtonElement;
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
    btn.focus();
    expect(document.activeElement).toBe(btn);
    fireEvent.click(btn);
  });

  it('le bouton "Afficher de plus" expose aria-controls/aria-expanded et un libellé lisible', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      overdueTasks: Array.from({ length: 6 }, (_, i) => ({
        id: i, title: `Tâche ${i}`,
        dueDate: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      })),
    });
    render(<PriorityActionCard equipment={equipment} />);
    const more = screen.getByRole('button', { name: /Afficher les 2 éléments supplémentaires/i });
    expect(more.getAttribute('aria-expanded')).toBe('false');
    expect(more.getAttribute('aria-controls')).toBe('priority-action-card-items');
    fireEvent.click(more);
    const reduce = screen.getByRole('button', { name: /Réduire la liste des éléments/i });
    expect(reduce.getAttribute('aria-expanded')).toBe('true');
  });

  it('le bouton "Voir toutes les actions" précise l\'onglet cible dans son aria-label', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      criticalPoints: [{ id: 'p1', title: 'Fuite' }],
    });
    const onNavigateToTab = vi.fn();
    render(<PriorityActionCard equipment={equipment} onNavigateToTab={onNavigateToTab} />);
    const link = screen.getByRole('button', { name: /Voir tous les points dans l'onglet Points/i });
    fireEvent.click(link);
    expect(onNavigateToTab).toHaveBeenCalledWith('points');
  });
});