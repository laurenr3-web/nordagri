
import * as z from "zod";

// Schema for intervention form validation
export const interventionFormSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères",
  }),
  equipment: z.string({
    required_error: "Veuillez sélectionner un équipement",
  }),
  equipmentId: z.number({
    required_error: "L'ID de l'équipement est requis",
  }),
  location: z.string({
    required_error: "La localisation est requise",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Veuillez sélectionner une priorité",
  }),
  date: z.date({
    required_error: "La date est requise",
  }),
  scheduledDuration: z.coerce
    .number()
    .min(0.5, {
      message: "La durée doit être d'au moins 30 minutes",
    })
    .default(1),
  technician: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
});

export type InterventionFormValues = z.infer<typeof interventionFormSchema>;
