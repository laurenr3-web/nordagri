
import { useToast, toast } from "@/hooks/use-toast";

// Ajouter la configuration WDYR pour ce composant
if (process.env.NODE_ENV === 'development') {
  // We need to set the property on the function itself
  // @ts-ignore - We know this property doesn't exist in the type definition
  useToast.whyDidYouRender = true;
}

export { useToast, toast };
