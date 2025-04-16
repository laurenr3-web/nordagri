import { z } from 'zod';

export const equipmentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  type: z.string().min(1, { message: 'Please select a type.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  manufacturer: z.string().min(2, { message: 'Manufacturer must be at least 2 characters.' }),
  model: z.string().min(1, { message: 'Model is required.' }),
  year: z.string().regex(/^\d{4}$/, { message: 'Please enter a valid year (e.g., 2023).' }),
  serialNumber: z.string().min(1, { message: 'Serial number is required.' }),
  status: z.string().min(1, { message: 'Please select a status.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  purchaseDate: z.coerce.date(),
  unite_d_usure: z.string().min(1, { message: "L'unité d'usure est requise" }),
  valeur_actuelle: z.number().min(0, { message: "La valeur doit être positive" }),
  notes: z.string().optional(),
  image: z.string().optional(),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;
