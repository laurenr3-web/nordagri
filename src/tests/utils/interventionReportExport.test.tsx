
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportInterventionToPDF } from '@/utils/pdf-export/intervention-report';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { InterventionReportPDF } from '@/components/interventions/reports/InterventionReportPDF';

// Mocks pour pdf et saveAs
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn().mockReturnValue({
    toBlob: vi.fn().mockResolvedValue(new Blob(['dummy pdf content'], { type: 'application/pdf' }))
  }),
  Document: ({ children }: { children: any }) => children,
  Page: ({ children }: { children: any }) => children,
  View: ({ children }: { children: any }) => children,
  StyleSheet: {
    create: vi.fn().mockReturnValue({})
  }
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

vi.mock('@/components/interventions/reports/InterventionReportPDF', () => ({
  InterventionReportPDF: vi.fn().mockReturnValue(null)
}));

describe('exportInterventionToPDF utility', () => {
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
    date: new Date("2023-05-18"),
    duration: 2,
    scheduledDuration: 3,
    technician: "Jean Dupont",
    description: "Maintenance régulière du tracteur",
    partsUsed: [
      { partId: 101, name: "Filtre à huile", quantity: 1 }
    ],
    notes: "RAS"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls pdf with InterventionReportPDF component', async () => {
    await exportInterventionToPDF(mockIntervention);
    
    // Vérification que pdf a été appelé avec InterventionReportPDF
    expect(pdf).toHaveBeenCalled();
    expect(InterventionReportPDF).toHaveBeenCalledWith(
      {
        intervention: mockIntervention,
        reportNotes: undefined,
        actualDuration: undefined
      },
      expect.anything()
    );
  });

  it('passes optional options to InterventionReportPDF', async () => {
    const options = {
      reportNotes: "Notes supplémentaires",
      actualDuration: 2.5
    };
    
    await exportInterventionToPDF(mockIntervention, options);
    
    expect(InterventionReportPDF).toHaveBeenCalledWith(
      {
        intervention: mockIntervention,
        reportNotes: "Notes supplémentaires",
        actualDuration: 2.5
      },
      expect.anything()
    );
  });

  it('uses default filename if none provided', async () => {
    await exportInterventionToPDF(mockIntervention);
    
    // Vérification du nom de fichier par défaut
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      "intervention-1-2023-05-18.pdf"
    );
  });

  it('uses custom filename if provided', async () => {
    await exportInterventionToPDF(mockIntervention, { filename: "rapport-custom" });
    
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      "rapport-custom.pdf"
    );
  });

  it('handles Date object for intervention date', async () => {
    const interventionWithDateObj = {
      ...mockIntervention,
      date: new Date('2023-05-18')
    };
    
    await exportInterventionToPDF(interventionWithDateObj);
    
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining("2023-05-18")
    );
  });
});
