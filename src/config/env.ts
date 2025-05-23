
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  VITE_PERPLEXITY_API_KEY: z.string().optional(),
  VITE_NOTIFICATIONS_API_KEY: z.string().optional(),
});

// Valider les variables d'environnement au démarrage
const envVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_PERPLEXITY_API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY,
  VITE_NOTIFICATIONS_API_KEY: import.meta.env.VITE_NOTIFICATIONS_API_KEY,
};

// Parse et valider
export const env = envSchema.parse(envVars);

// Export typé pour une meilleure DX
export type Env = z.infer<typeof envSchema>;
