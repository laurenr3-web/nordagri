
import * as React from "react"

// Constante pour la taille de breakpoint mobile
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // State initial avec valeur undefined pour éviter l'hydratation SSR incorrecte
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Vérification de l'existence de window (pour la compatibilité SSR)
    if (typeof window === 'undefined') return;
    
    // Fonction pour vérifier la taille de l'écran
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Vérification initiale
    checkIfMobile()
    
    // Ajout du listener pour les changements de taille
    window.addEventListener("resize", checkIfMobile)
    
    // Nettoyage du listener
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Par défaut, considérer non-mobile si window n'est pas défini (SSR)
  return isMobile !== undefined ? isMobile : false;
}
