
import { z } from 'zod';

export const partFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  partNumber: z.string().min(1, "La référence est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  manufacturer: z.string().optional(),
  price: z.string().optional(),
  stock: z.string().optional(),
  reorderPoint: z.string().optional(),
  location: z.string().optional(),
  compatibility: z.array(z.number()).default([]), // Tableau de nombres (IDs d'équipements)
  image: z.string().optional()
});

export interface PartFormValues extends z.infer<typeof partFormSchema> {}

export interface AddPartFormProps {
  onSuccess?: (data: PartFormValues) => void;
  onCancel?: () => void;
}
