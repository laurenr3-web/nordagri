
import * as React from "react"

// Constante pour la taille de breakpoint mobile
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Vérification initiale
    checkIfMobile()
    
    // Ajout du listener pour les changements de taille
    window.addEventListener("resize", checkIfMobile)
    
    // Nettoyage du listener
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}
