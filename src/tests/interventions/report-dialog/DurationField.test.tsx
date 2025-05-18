
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DurationField } from '@/components/interventions/dialogs/report-dialog/form-fields/DurationField';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schéma minimal pour le test
const testSchema = z.object({
  duration: z.coerce.number().min(0.1)
});

// Wrapper pour tester le composant avec react-hook-form
const DurationFieldWrapper = () => {
  const form = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      duration: 1
    }
  });

  return (
    <Form {...form}>
      <DurationField control={form.control} />
    </Form>
  );
};

describe('DurationField Component', () => {
  it('renders correctly', () => {
    render(<DurationFieldWrapper />);
    
    // Vérification de la présence du label
    expect(screen.getByText('Durée réelle (heures)')).toBeInTheDocument();
    
    // Vérification de la présence du champ input
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    
    // Vérification de la description
    expect(screen.getByText('Durée effective de l\'intervention')).toBeInTheDocument();
  });
});
