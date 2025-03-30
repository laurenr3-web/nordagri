
import React from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormWrapperProps<T extends z.ZodType> {
  schema: T;
  onSubmit: SubmitHandler<z.infer<T>>;
  defaultValues?: Partial<z.infer<T>>;
  children: React.ReactNode;
  submitText?: string;
  isSubmitting?: boolean;
  submitClassName?: string;
  cancelButton?: React.ReactNode;
}

export function FormWrapper<T extends z.ZodType>({
  schema,
  onSubmit,
  defaultValues,
  children,
  submitText = 'Enregistrer',
  isSubmitting = false,
  submitClassName = '',
  cancelButton,
}: FormWrapperProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {children}
        <div className="flex justify-end gap-2 mt-6">
          {cancelButton}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={submitClassName}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
