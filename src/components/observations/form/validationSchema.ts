
import { z } from "zod";
import { ObservationType, UrgencyLevel } from '@/types/FieldObservation';

export const observationFormSchema = z.object({
  equipment_id: z.number({
    required_error: "Veuillez sélectionner un équipement",
    invalid_type_error: "L'équipement doit être un nombre"
  }).nullable().refine(value => value !== null, {
    message: "La sélection d'un équipement est obligatoire"
  }),
  
  observation_type: z.custom<ObservationType>((val) => {
    const validTypes = ['panne', 'usure', 'maintenance', 'autre'];
    return validTypes.includes(val as string);
  }, {
    message: "Veuillez sélectionner un type d'observation valide"
  }),
  
  urgency_level: z.custom<UrgencyLevel>((val) => {
    const validLevels = ['normal', 'surveiller', 'urgent'];
    return validLevels.includes(val as string);
  }, {
    message: "Veuillez sélectionner un niveau d'urgence valide"
  }),
  
  location: z.string().max(255, {
    message: "La localisation ne doit pas dépasser 255 caractères"
  }).optional(),
  
  description: z.string().max(1000, {
    message: "La description ne doit pas dépasser 1000 caractères"
  }).optional(),
  
  photos: z.array(z.string()).optional()
});

export type ObservationFormValues = z.infer<typeof observationFormSchema>;
