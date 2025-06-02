
import { z } from 'zod';

const productionConfigSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  NODE_ENV: z.string().optional(),
});

// Configuration spécifique pour la production
const getProductionConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const currentDomain = window.location.hostname;
  
  // Configuration par domaine
  const domainConfigs = {
    'nordagri.ca': {
      timeout: 45000, // Timeout plus long pour la production
      retryAttempts: 3,
      authRetryDelay: 2000,
    },
    'localhost': {
      timeout: 30000,
      retryAttempts: 2,
      authRetryDelay: 1000,
    }
  };

  const config = domainConfigs[currentDomain as keyof typeof domainConfigs] || domainConfigs['localhost'];

  return {
    ...config,
    isDevelopment,
    currentDomain,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
};

export const productionConfig = getProductionConfig();

// Validation des variables d'environnement
try {
  productionConfigSchema.parse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    NODE_ENV: import.meta.env.NODE_ENV,
  });
} catch (error) {
  console.error('❌ Configuration de production invalide:', error);
}

export type ProductionConfig = typeof productionConfig;
