import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';

// Stub all heavy tab content children to keep this a pure structural test
vi.mock('@/components/equipment/details/EquipmentOverview', () => ({ EquipmentOverview: () => <div /> }));
vi.mock('@/components/equipment/detail/OverviewRecent', () => ({ default: () => <div data-testid="content-overview" /> }));
vi.mock('@/components/equipment/details/EquipmentMaintenanceStatus', () => ({ default: () => <div data-testid="content-maintenance" /> }));
vi.mock('@/components/equipment/tabs/EquipmentParts', () => ({ default: () => <div data-testid="content-parts" /> }));
vi.mock('@/components/equipment/tabs/EquipmentTimeTracking', () => ({ default: () => <div /> }));
vi.mock('@/components/equipment/tabs/EquipmentPerformance', () => ({ default: () => <div /> }));
vi.mock('@/components/equipment/tabs/EquipmentMaintenanceHistory', () => ({ default: () => <div data-testid="content-history" /> }));
vi.mock('@/components/equipment/tabs/EquipmentQRCode', () => ({ default: () => <div data-testid="content-qrcode" /> }));
vi.mock('@/components/equipment/tabs/fuel/EquipmentFuelLogs', () => ({ default: () => <div /> }));
vi.mock('@/components/equipment/detail/EquipmentPointsList', () => ({ default: () => <div data-testid="content-points" /> }));

import EquipmentTabs from '@/components/equipment/details/EquipmentTabs';

const equipment = { id: 1, name: 'Tracteur' } as any;

describe('EquipmentTabs (non-régression sections fiche équipement)', () => {
  it('rend les 6 onglets attendus', () => {
    render(<EquipmentTabs equipment={equipment} />);
    ["Vue d'ensemble", 'Maintenance', 'Points', 'Historique', 'Pièces', 'QR code']
      .forEach((label) => expect(screen.getByText(label)).toBeTruthy());
  });

  it("affiche par défaut le contenu de la vue d'ensemble", () => {
    render(<EquipmentTabs equipment={equipment} />);
    expect(screen.getByTestId('content-overview')).toBeTruthy();
  });

  it('change de contenu au clic sur un onglet', () => {
    render(<EquipmentTabs equipment={equipment} />);
    fireEvent.click(screen.getByText('Maintenance'));
    expect(screen.getByTestId('content-maintenance')).toBeTruthy();
    fireEvent.click(screen.getByText('Points'));
    expect(screen.getByTestId('content-points')).toBeTruthy();
    fireEvent.click(screen.getByText('QR code'));
    expect(screen.getByTestId('content-qrcode')).toBeTruthy();
  });

  it("notifie le parent via onTabChange et respecte activeTab contrôlé", () => {
    const onTabChange = vi.fn();
    const { rerender } = render(
      <EquipmentTabs equipment={equipment} activeTab="overview" onTabChange={onTabChange} />,
    );
    fireEvent.click(screen.getByText('Pièces'));
    expect(onTabChange).toHaveBeenCalledWith('parts');
    rerender(<EquipmentTabs equipment={equipment} activeTab="parts" onTabChange={onTabChange} />);
    expect(screen.getByTestId('content-parts')).toBeTruthy();
  });
});