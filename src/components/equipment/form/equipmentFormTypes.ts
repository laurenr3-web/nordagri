
import { z } from 'zod';

// Schéma de validation pour le formulaire d'équipement
export const equipmentFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  type: z.string().min(1, 'Le type est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(['operational', 'maintenance', 'repair', 'inactive']),
  location: z.string().optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().optional(),
  image: z.string().optional()
});

// Type dérivé du schéma zod
export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

// Types pour le statut de l'équipement
export type EquipmentStatus = 'operational' | 'maintenance' | 'repair' | 'inactive';
