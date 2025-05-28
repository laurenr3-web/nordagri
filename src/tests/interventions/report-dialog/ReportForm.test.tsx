
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { ReportForm } from '@/components/interventions/dialogs/report-dialog/ReportForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Mock des composants enfants
vi.mock('@/components/interventions/dialogs/report-dialog/form-fields/DurationField', () => ({
  DurationField: () => <div data-testid="duration-field">DurationField</div>
}));

vi.mock('@/components/interventions/dialogs/report-dialog/form-fields/PartsUsedField', () => ({
  PartsUsedField: () => <div data-testid="parts-used-field">PartsUsedField</div>
}));

vi.mock('@/components/interventions/dialogs/report-dialog/form-fields/NotesField', () => ({
  NotesField: () => <div data-testid="notes-field">NotesField</div>
}));

// Schéma minimal pour le test
const testSchema = z.object({
  duration: z.coerce.number().min(0.1),
  notes: z.string().min(1),
  partsUsed: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number().min(1)
    })
  ).optional()
});

type TestFormValues = z.infer<typeof testSchema>;

// Wrapper pour tester le composant avec react-hook-form
const ReportFormWrapper = () => {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      duration: 1,
      notes: "Notes test",
      partsUsed: []
    }
  });

  return (
    <ReportForm
      form={form}
      availableParts={[
        { id: 1, name: 'Filtre à huile', quantity: 10 },
        { id: 2, name: 'Filtre à air', quantity: 5 }
      ]}
    />
  );
};

describe('ReportForm Component', () => {
  it('renders all field components', () => {
    render(<ReportFormWrapper />);
    
    expect(screen.getByTestId('duration-field')).toBeTruthy();
    expect(screen.getByTestId('parts-used-field')).toBeTruthy();
    expect(screen.getByTestId('notes-field')).toBeTruthy();
  });
});
