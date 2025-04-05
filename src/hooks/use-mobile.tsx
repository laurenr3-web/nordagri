import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Hook pour détecter si l'appareil est mobile basé sur la largeur de l'écran
 * @returns boolean indiquant si l'appareil est considéré comme mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // S'assurer que window existe (pour éviter les erreurs en SSR)
    if (typeof window === 'undefined') {
      return
    }
    
    // Fonction pour déterminer si l'écran est considéré comme mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Vérification initiale
    checkIsMobile()
    
    // Simple approche pour tous les navigateurs
    const handleResize = () => checkIsMobile()
    window.addEventListener('resize', handleResize)
    
    // Cleanup function
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Par défaut, on retourne false jusqu'à ce que le useEffect s'exécute
  return isMobile
}
