import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook pour détecter si l'appareil est mobile basé sur la largeur de l'écran
 * @returns boolean indiquant si l'appareil est considéré comme mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // S'assurer que window existe (pour éviter les erreurs en SSR)
    if (typeof window === 'undefined') {
      return
    }
    
    // Fonction pour déterminer si l'écran est considéré comme mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Configurer le media query listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Faire une vérification initiale
    checkIsMobile()
    
    // Configurer le listener pour les changements de taille
    const onChange = () => checkIsMobile()
    
    try {
      // API moderne pour les navigateurs récents
      mql.addEventListener("change", onChange)
      
      // Cleanup function
      return () => mql.removeEventListener("change", onChange)
    } catch (e) {
      // Fallback pour les navigateurs plus anciens
      // Note: addListener est déprécié mais fonctionne dans les anciens navigateurs
      mql.addListener(onChange)
      
      // Cleanup function
      return () => mql.removeListener(onChange)
    }
  }, [])

  // Retourner false comme valeur par défaut jusqu'à ce que l'état soit défini
  return isMobile ?? false
}
