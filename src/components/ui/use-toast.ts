
import { useToast, toast } from "@/hooks/use-toast";

// Ajouter la configuration WDYR pour ce composant
if (process.env.NODE_ENV === 'development') {
  useToast.whyDidYouRender = true;
}

export { useToast, toast };
