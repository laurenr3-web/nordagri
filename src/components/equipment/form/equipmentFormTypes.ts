
import { z } from 'zod';

// Define the validation schema for equipment form values
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
  purchaseDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
});

// Derive TypeScript type from zod schema
export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;
