
import { z } from 'zod';

export const partFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  partNumber: z.string().min(1, {
    message: "Le numéro de pièce est requis",
  }),
  category: z.string().min(1, {
    message: "La catégorie est requise",
  }),
  manufacturer: z.string().min(1, {
    message: "Le fabricant est requis",
  }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Le prix doit être un nombre valide",
  }),
  stock: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Le stock doit être un nombre entier valide",
  }),
  location: z.string().optional(),
  reorderPoint: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Le point de réapprovisionnement doit être un nombre valide",
  }),
  compatibility: z.string().optional(),
  compatibilityIds: z.array(z.string()), // Changed to string[] to match Supabase
  image: z.string().url({
    message: "Veuillez fournir une URL valide pour l'image",
  }).optional().or(z.literal('')),
});

export type PartFormValues = z.infer<typeof partFormSchema>;
