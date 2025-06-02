
import { z } from 'zod';

const secureConfigSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
});

// Only include non-sensitive environment variables
const publicEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Parse and validate only public environment variables
export const secureConfig = secureConfigSchema.parse(publicEnvVars);

// Export typé pour une meilleure DX
export type SecureConfig = z.infer<typeof secureConfigSchema>;
