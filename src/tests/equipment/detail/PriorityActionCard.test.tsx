import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';

// Mock dialogs (heavy children, irrelevant here)
vi.mock('@/components/maintenance/dialogs/MaintenanceTaskDetailDialog', () => ({
  default: () => null,
}));
vi.mock('@/components/points/PointDetailDialog', () => ({
  PointDetailDialog: () => null,
}));

// Mock the shared snapshot hook
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

describe('PriorityActionCard — badges & compteurs', () => {
  it('affiche l\'état vide quand le snapshot ne contient rien', () => {
    snapshotMock.mockReturnValue(baseSnap);
    render(<PriorityActionCard equipment={equipment} />);
    expect(screen.getByText(/Rien à faire pour le moment/i)).toBeTruthy();
    expect(screen.queryByText(/en retard/i)).toBeNull();
  });

  it('affiche le bon compteur "en retard" et le badge Retard sur la ligne', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      overdueTasks: [
        { id: 1, title: 'Vidange', dueDate: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, title: 'Filtre', dueDate: new Date(Date.now() - 2 * 86400000).toISOString() },
      ],
    });
    render(<PriorityActionCard equipment={equipment} />);
    expect(screen.getByText('2 en retard')).toBeTruthy();
    expect(screen.getAllByText('Retard').length).toBeGreaterThan(0);
  });

  it('affiche les badges Critique / Important / à venir avec les bons comptes', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      criticalPoints: [{ id: 'p1', title: 'Fuite huile' }],
      importantPoints: [
        { id: 'p2', title: 'Vibration' },
        { id: 'p3', title: 'Bruit' },
      ],
      upcomingTasks: [
        { id: 't1', title: 'Graissage', dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
      ],
    });
    render(<PriorityActionCard equipment={equipment} />);
    expect(screen.getByText('1 critique')).toBeTruthy();
    expect(screen.getByText('2 importants')).toBeTruthy();
    expect(screen.getByText('1 à venir')).toBeTruthy();
    // Total éléments dans le header
    expect(screen.getByText('4 éléments')).toBeTruthy();
  });

  it('limite l\'affichage initial à 4 lignes et propose d\'en afficher plus', () => {
    snapshotMock.mockReturnValue({
      ...baseSnap,
      overdueTasks: Array.from({ length: 6 }, (_, i) => ({
        id: i, title: `Tâche ${i}`,
        dueDate: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      })),
    });
    render(<PriorityActionCard equipment={equipment} />);
    expect(screen.getByText('Tâche 0')).toBeTruthy();
    expect(screen.getByText('Tâche 3')).toBeTruthy();
    expect(screen.queryByText('Tâche 4')).toBeNull();
    expect(screen.getByText(/Afficher 2 de plus/i)).toBeTruthy();
  });
});