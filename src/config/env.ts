
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  VITE_PERPLEXITY_API_KEY: z.string().optional(),
  VITE_NOTIFICATIONS_API_KEY: z.string().optional(),
});

// Configuration avec fallbacks pour la production
const getEnvConfig = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://cagmgtmeljxykyngxxmj.supabase.co',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZ21ndG1lbGp4eWt5bmd4eG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTAzNzksImV4cCI6MjA1ODMyNjM3OX0.3VFhuErdDDheXKX4djJvx4JzhSfpsApPu6hLl1bArUk',
    VITE_PERPLEXITY_API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY,
    VITE_NOTIFICATIONS_API_KEY: import.meta.env.VITE_NOTIFICATIONS_API_KEY,
  };

  // Diagnostic pour aider au debugging
  console.log('Configuration environnement:', {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    usingFallbacks: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  try {
    return envSchema.parse(envVars);
  } catch (error) {
    console.warn('Validation des variables d\'environnement échouée, utilisation des valeurs par défaut:', error);
    // Retourner les valeurs par défaut en cas d'échec de validation
    return {
      VITE_SUPABASE_URL: envVars.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: envVars.VITE_SUPABASE_ANON_KEY,
      VITE_PERPLEXITY_API_KEY: envVars.VITE_PERPLEXITY_API_KEY,
      VITE_NOTIFICATIONS_API_KEY: envVars.VITE_NOTIFICATIONS_API_KEY,
    };
  }
};

// Export de la configuration validée avec fallbacks
export const env = getEnvConfig();
export type Env = z.infer<typeof envSchema>;
