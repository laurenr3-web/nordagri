
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInterventionReportForm } from '@/components/interventions/dialogs/hooks/useInterventionReportForm';
import { exportInterventionToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

// Mocks
vi.mock('@/utils/pdfExport', () => ({
  exportInterventionToPDF: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useInterventionReportForm hook', () => {
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
    date: new Date('2023-05-18'),
    scheduledDuration: 3,
    technician: "Jean Dupont",
    description: "Maintenance régulière",
    partsUsed: [],
    notes: ""
  };

  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes form with default values from intervention', () => {
    const { result } = renderHook(() => 
      useInterventionReportForm({
        intervention: mockIntervention,
        onSubmit: mockOnSubmit,
        onOpenChange: mockOnOpenChange
      })
    );

    expect(result.current.form.getValues('duration')).toBe(3);
    expect(result.current.form.getValues('notes')).toBe(
      "Intervention Maintenance préventive réalisée sur l'équipement Tracteur John Deere."
    );
  });

  it('handles submit and calls onSubmit and onOpenChange', async () => {
    const { result } = renderHook(() => 
      useInterventionReportForm({
        intervention: mockIntervention,
        onSubmit: mockOnSubmit,
        onOpenChange: mockOnOpenChange
      })
    );

    const formValues = {
      duration: 2,
      notes: "Intervention terminée",
      partsUsed: [{ id: 1, name: "Pièce test", quantity: 1 }]
    };

    await act(async () => {
      result.current.handleSubmit(formValues);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(mockIntervention, formValues);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('exports PDF correctly on handleExportToPDF', async () => {
    const { result } = renderHook(() => 
      useInterventionReportForm({
        intervention: mockIntervention,
        onSubmit: mockOnSubmit,
        onOpenChange: mockOnOpenChange
      })
    );

    await act(async () => {
      await result.current.handleExportToPDF();
    });

    expect(exportInterventionToPDF).toHaveBeenCalledWith(
      mockIntervention,
      expect.objectContaining({
        reportNotes: expect.any(String),
        actualDuration: expect.any(Number)
      })
    );
    
    expect(toast.success).toHaveBeenCalled();
  });

  it('handles error during PDF export', async () => {
    // Simuler une erreur lors de l'export
    (exportInterventionToPDF as any).mockRejectedValueOnce(new Error('Export error'));
    
    const { result } = renderHook(() => 
      useInterventionReportForm({
        intervention: mockIntervention,
        onSubmit: mockOnSubmit,
        onOpenChange: mockOnOpenChange
      })
    );

    await act(async () => {
      await result.current.handleExportToPDF();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('handles parts management functions', () => {
    const { result } = renderHook(() => 
      useInterventionReportForm({
        intervention: mockIntervention,
        onSubmit: mockOnSubmit,
        onOpenChange: mockOnOpenChange
      })
    );

    // Test addPart avec une nouvelle pièce
    act(() => {
      result.current.addPart({ id: 1, name: "Filtre" });
    });

    expect(result.current.form.getValues('partsUsed')).toEqual([
      { id: 1, name: "Filtre", quantity: 1 }
    ]);

    // Test addPart avec une pièce existante (incrémentation)
    act(() => {
      result.current.addPart({ id: 1, name: "Filtre" });
    });

    expect(result.current.form.getValues('partsUsed')).toEqual([
      { id: 1, name: "Filtre", quantity: 2 }
    ]);

    // Test updatePartQuantity
    act(() => {
      result.current.updatePartQuantity(1, 5);
    });

    expect(result.current.form.getValues('partsUsed')).toEqual([
      { id: 1, name: "Filtre", quantity: 5 }
    ]);

    // Test removePart
    act(() => {
      result.current.removePart(1);
    });

    expect(result.current.form.getValues('partsUsed')).toEqual([]);
  });
});
