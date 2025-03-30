
import { useToast, toast } from "@/hooks/use-toast";

// La propriété whyDidYouRender doit être définie sur la fonction elle-même,
// et non sur l'export qui n'est pas une fonction
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - Nous savons que cette propriété n'existe pas dans la définition de type
  useToast.whyDidYouRender = true;
}

export { useToast, toast };
