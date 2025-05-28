import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotesField } from '@/components/interventions/dialogs/report-dialog/form-fields/NotesField';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InterventionReportFormValues } from '@/components/interventions/dialogs/hooks/useInterventionReportForm';

// Schéma minimal pour le test
const testSchema = z.object({
  notes: z.string().min(1)
});

// Wrapper pour tester le composant avec react-hook-form
const NotesFieldWrapper = () => {
  const form = useForm<Pick<InterventionReportFormValues, 'notes'>>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      notes: ''
    }
  });

  return (
    <Form {...form}>
      <NotesField control={form.control as any} />
    </Form>
  );
};

describe('NotesField Component', () => {
  it('renders correctly', () => {
    render(<NotesFieldWrapper />);
    
    // Vérification de la présence du label
    expect(screen.getByText('Compte-rendu')).toBeTruthy();
    
    // Vérification de la présence du textarea
    const textarea = screen.getByPlaceholderText('Décrivez les travaux effectués et observations');
    expect(textarea).toBeTruthy();
  });
});
