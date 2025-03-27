
import { z } from 'zod';

export interface PartFormValues {
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  price: string;
  stock: string;
  reorderPoint: string;
  location: string;
  compatibility: string;
  image: string;
}

export const partFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  partNumber: z.string(),
  category: z.string(),
  manufacturer: z.string(),
  price: z.string(),
  stock: z.string(),
  reorderPoint: z.string(),
  location: z.string(),
  compatibility: z.string(),
  image: z.string(),
});
