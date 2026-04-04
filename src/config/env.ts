
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Supabase publishable key is required"),
  VITE_PERPLEXITY_API_KEY: z.string().optional(),
  VITE_NOTIFICATIONS_API_KEY: z.string().optional(),
});

const getEnvConfig = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_PERPLEXITY_API_KEY: import.meta.env.VITE_PERPLEXITY_API_KEY,
    VITE_NOTIFICATIONS_API_KEY: import.meta.env.VITE_NOTIFICATIONS_API_KEY,
  };

  try {
    return envSchema.parse(envVars);
  } catch (error) {
    console.warn('Environment variable validation failed:', error);
    return envVars;
  }
};

export const env = getEnvConfig();
export type Env = z.infer<typeof envSchema>;
