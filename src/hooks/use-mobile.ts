
import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier si l'écran est mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px est la taille sm dans tailwind
    };

    // Vérifier au chargement initial
    checkIfMobile();

    // Ajouter le listener pour vérifier à chaque redimensionnement
    window.addEventListener("resize", checkIfMobile);

    // Nettoyer le listener quand le composant est démonté
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
}
