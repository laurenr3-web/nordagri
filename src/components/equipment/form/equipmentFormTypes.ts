import { z } from 'zod';

export const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Equipment name must be at least 2 characters.",
  }),
  type: z.string().min(2, {
    message: "Equipment type must be at least 2 characters.",
  }),
  category: z.string().min(2, {
    message: "Equipment category must be at least 2 characters.",
  }),
  manufacturer: z.string().min(2, {
    message: "Equipment manufacturer must be at least 2 characters.",
  }),
  model: z.string().min(2, {
    message: "Equipment model must be at least 2 characters.",
  }),
  year: z.string().regex(/^\d{4}$/, {
    message: "Please enter a valid year.",
  }),
  serialNumber: z.string().min(2, {
    message: "Serial number must be at least 2 characters.",
  }),
  status: z.string(),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid purchase date in YYYY-MM-DD format.",
  }),
  notes: z.string().optional(),
  image: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export interface EquipmentFormProps {
  onSubmit: (data: EquipmentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<EquipmentFormValues>;
}
