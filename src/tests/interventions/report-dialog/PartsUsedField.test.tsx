import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartsUsedField } from '@/components/interventions/dialogs/report-dialog/form-fields/PartsUsedField';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InterventionReportFormValues } from '@/components/interventions/dialogs/hooks/useInterventionReportForm';

// Définition du type Part pour le test
interface Part {
  id: number;
  name: string;
  quantity: number;
}

// Schéma minimal pour le test
const testSchema = z.object({
  partsUsed: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number().min(1)
    })
  ).optional()
});

type TestFormValues = Pick<InterventionReportFormValues, 'partsUsed'>;

// Wrapper pour tester le composant avec react-hook-form
const PartsUsedFieldWrapper = ({ availableParts }: { availableParts: Part[] }) => {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      partsUsed: []
    }
  });

  return (
    <Form {...form}>
      <PartsUsedField 
        control={form.control as any}
        availableParts={availableParts}
        watch={form.watch}
        getValues={form.getValues}
        setValue={form.setValue}
      />
    </Form>
  );
};

describe('PartsUsedField Component', () => {
  it('renders empty state initially', () => {
    render(<PartsUsedFieldWrapper availableParts={[]} />);
    
    expect(screen.getByText('Pièces utilisées')).toBeTruthy();
    expect(screen.getByText('Aucune pièce utilisée')).toBeTruthy();
  });

  it('renders available parts buttons', () => {
    const mockParts = [
      { id: 1, name: 'Filtre à huile', quantity: 10 },
      { id: 2, name: 'Filtre à air', quantity: 5 }
    ];
    
    render(<PartsUsedFieldWrapper availableParts={mockParts} />);
    
    expect(screen.getByText('Ajouter une pièce :')).toBeTruthy();
    expect(screen.getByText('Filtre à huile')).toBeTruthy();
    expect(screen.getByText('Filtre à air')).toBeTruthy();
  });
});
