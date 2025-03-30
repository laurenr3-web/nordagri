
// Import directement du hook
import { useToast as useShadcnToast, toast } from "@/hooks/use-toast";

// Exporter pour une utilisation cohérente dans l'application
export const useToast = useShadcnToast;
export { toast };
