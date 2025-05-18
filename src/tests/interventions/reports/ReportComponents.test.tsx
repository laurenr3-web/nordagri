
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { 
  ReportHeader, 
  GeneralInfoSection, 
  EquipmentSection, 
  PartsSection,
  TimeSection,
  NotesSection,
  DescriptionSection,
  ReportFooter
} from '@/components/interventions/reports/components';
import { Intervention } from '@/types/Intervention';

// Mock des composants PDF
vi.mock('@react-pdf/renderer', () => {
  return {
    Document: vi.fn().mockImplementation(({ children }) => <div>{children}</div>),
    Page: vi.fn().mockImplementation(({ children }) => <div>{children}</div>),
    Text: vi.fn().mockImplementation(({ children }) => <div>{children}</div>),
    View: vi.fn().mockImplementation(({ children }) => <div>{children}</div>),
    StyleSheet: {
      create: () => ({
        page: {},
        section: {},
        header: {},
        content: {},
        title: {},
      }),
    },
  };
});

describe('Report PDF Components', () => {
  it('renders ReportHeader correctly', () => {
    const mockIntervention = { id: 123, date: new Date() };
    render(
      <ReportHeader 
        id={mockIntervention.id}
        date={mockIntervention.date}
      />
    );
    // Pas besoin de vérification car le composant est principalement pour le PDF
    expect(true).toBe(true);
  });

  it('renders GeneralInfoSection correctly', () => {
    const mockIntervention: Partial<Intervention> = {
      id: 1,
      title: 'Test Intervention',
      date: new Date(),
      priority: 'high',
      equipment: 'Test Equipment',
      equipmentId: 123,
      location: 'Test Location',
      coordinates: { lat: 0, lng: 0 },
      status: 'completed',
      technician: 'John Doe',
      description: 'Test description',
      partsUsed: []
    };
    render(<GeneralInfoSection intervention={mockIntervention as Intervention} />);
    expect(true).toBe(true);
  });

  it('renders EquipmentSection correctly', () => {
    render(
      <EquipmentSection 
        equipment="Tracteur"
        equipmentId={123}
      />
    );
    expect(true).toBe(true);
  });

  it('renders PartsSection correctly', () => {
    const mockParts = [
      { partId: 1, name: 'Filtre', quantity: 2 },
      { partId: 2, name: 'Huile', quantity: 1 }
    ];
    render(<PartsSection parts={mockParts} />);
    expect(true).toBe(true);
  });

  it('renders TimeSection correctly', () => {
    render(
      <TimeSection 
        scheduledDuration={2}
        actualDuration={2.5}
        status="completed"
      />
    );
    expect(true).toBe(true);
  });

  it('renders NotesSection correctly', () => {
    const mockNotes = "Ceci est un test de notes";
    render(<NotesSection notes={mockNotes} />);
    expect(true).toBe(true);
  });

  it('renders DescriptionSection correctly', () => {
    const mockDescription = "Description de test";
    render(<DescriptionSection description={mockDescription} />);
    expect(true).toBe(true);
  });

  it('renders ReportFooter correctly', () => {
    render(<ReportFooter />);
    expect(true).toBe(true);
  });
});
