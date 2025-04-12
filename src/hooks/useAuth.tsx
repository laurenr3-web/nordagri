
import { useAuth as useAuthCore } from '@/core/auth';

/**
 * Hook d'authentification pour gérer l'état de l'utilisateur et les redirections
 * @param requireAuth Si true, redirige vers la page d'authentification si l'utilisateur n'est pas connecté
 * @param redirectTo Page de redirection après authentification (défaut: page actuelle)
 */
export function useAuth(requireAuth = true, redirectTo?: string) {
  return useAuthCore(requireAuth, redirectTo);
}
