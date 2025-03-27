
import { z } from 'zod';

export const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  type: z.string().min(1, {
    message: "Veuillez sélectionner un type",
  }),
  category: z.string().min(1, {
    message: "Veuillez sélectionner une catégorie",
  }),
  manufacturer: z.string().min(1, {
    message: "Le fabricant est requis",
  }),
  model: z.string().optional(),
  year: z.string().regex(/^\d{4}$/, {
    message: "L'année doit être au format YYYY",
  }),
  status: z.string().default("operational"),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().optional(),
  image: z.string().url({
    message: "Veuillez entrer une URL valide.",
  }),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export interface EquipmentFormProps {
  onSubmit: (data: EquipmentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<EquipmentFormValues>;
}
