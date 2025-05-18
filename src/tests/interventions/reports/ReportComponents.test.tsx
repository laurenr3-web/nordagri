
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@react-pdf/renderer';
import { ReportHeader } from '@/components/interventions/reports/components/ReportHeader';
import { GeneralInfoSection } from '@/components/interventions/reports/components/GeneralInfoSection';
import { EquipmentSection } from '@/components/interventions/reports/components/EquipmentSection';
import { TimeSection } from '@/components/interventions/reports/components/TimeSection';
import { NotesSection } from '@/components/interventions/reports/components/NotesSection';
import { PartsSection } from '@/components/interventions/reports/components/PartsSection';
import { DescriptionSection } from '@/components/interventions/reports/components/DescriptionSection';

// Note: Les tests de composants React PDF sont limités car ils ne peuvent pas être rendus facilement avec testing-library.
// Nous vérifions principalement qu'ils ne causent pas d'erreurs lors du rendu.

describe('PDF Report Components', () => {
  it('ReportHeader renders without crashing', async () => {
    // Le test vérifie que le rendu ne lance pas d'erreur
    expect(() => {
      render(<ReportHeader id={123} date="2023-05-18" />);
    }).not.toThrow();
  });

  it('GeneralInfoSection renders without crashing', async () => {
    const mockIntervention = {
      id: 1,
      title: "Maintenance préventive",
      equipment: "Tracteur John Deere",
      equipmentId: 42,
      location: "Champ Nord",
      coordinates: {
        lat: 48.8566,
        lng: 2.3522
      },
      status: "completed" as const,
      priority: "medium" as const,
      date: "2023-05-18",
      duration: 2,
      scheduledDuration: 3,
      technician: "Jean Dupont",
      description: "Maintenance régulière du tracteur",
      partsUsed: [
        { partId: 101, name: "Filtre à huile", quantity: 1 }
      ],
      notes: "RAS"
    };

    expect(() => {
      render(<GeneralInfoSection intervention={mockIntervention} />);
    }).not.toThrow();
  });

  it('EquipmentSection renders without crashing', async () => {
    expect(() => {
      render(<EquipmentSection equipment="Tracteur John Deere" equipmentId={42} />);
    }).not.toThrow();
  });

  it('TimeSection renders without crashing', async () => {
    expect(() => {
      render(<TimeSection scheduledDuration={3} actualDuration={2.5} status="completed" />);
    }).not.toThrow();
  });

  it('NotesSection renders without crashing', async () => {
    expect(() => {
      render(<NotesSection notes="Notes d'intervention" reportNotes="Rapport complémentaire" />);
    }).not.toThrow();
  });

  it('PartsSection renders without crashing', async () => {
    const mockParts = [
      { partId: 101, name: "Filtre à huile", quantity: 1 },
      { partId: 102, name: "Filtre à air", quantity: 2 }
    ];

    expect(() => {
      render(<PartsSection parts={mockParts} />);
    }).not.toThrow();
  });

  it('DescriptionSection renders without crashing', async () => {
    expect(() => {
      render(<DescriptionSection description="Description détaillée de l'intervention" />);
    }).not.toThrow();
  });
});
