
/**
 * Design System - Constants de design pour Agri ERP
 * Ce fichier centralise les valeurs de design pour assurer la cohérence visuelle
 */

// Système d'ombres standardisé
export const shadows = {
  sm: "shadow-sm", // Ombre légère pour délimiter subtilement
  md: "shadow-md", // Ombre moyenne pour les cartes et éléments clickables
  lg: "shadow-lg", // Ombre prononcée pour les éléments flottants
  xl: "shadow-xl", // Ombre importante pour les modales et dialogs
  elevated: "shadow-[0_10px_30px_rgba(0,0,0,0.08)]", // Ombre spéciale pour les éléments mis en avant
  inner: "shadow-inner", // Ombre intérieure pour les éléments enfoncés
  none: "shadow-none", // Pas d'ombre
};

// Système d'arrondis standardisé
export const roundings = {
  none: "rounded-none", // Pas d'arrondi
  sm: "rounded-sm", // Arrondi léger
  md: "rounded-md", // Arrondi moyen (standard)
  lg: "rounded-lg", // Arrondi prononcé
  xl: "rounded-xl", // Arrondi important
  full: "rounded-full", // Arrondi complet (cercle/pilule)
};

// Espacements standards pour marges et padding
export const spacing = {
  sections: "mb-6 mt-4", // Espacement entre sections
  widgets: "gap-6", // Espacement entre widgets
  card: "p-5", // Padding interne des cartes
  header: "mb-4", // Marge sous les en-têtes
};

// Typographie standardisée
export const typography = {
  heading1: "text-2xl font-semibold tracking-tight",
  heading2: "text-xl font-medium tracking-tight",
  heading3: "text-lg font-medium",
  subtitle: "text-sm text-muted-foreground",
  body: "text-sm",
  small: "text-xs",
};

// Standards d'animations pour l'application
export const animations = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in-right",
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse",
  // Durées standards
  durations: {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-500",
  },
  // Courbes d'accélération
  ease: {
    default: "ease-out",
    in: "ease-in",
    inOut: "ease-in-out",
  },
};

// Styles de transition standards
export const transitions = {
  default: "transition-all duration-300 ease-out",
  hover: "transition-transform duration-150 ease-out hover:scale-102",
  color: "transition-colors duration-200",
  opacity: "transition-opacity duration-300",
};

// Gradients prédéfinis
export const gradients = {
  primary: "bg-gradient-to-br from-agri-primary to-agri-secondary",
  subtle: "bg-gradient-to-br from-white to-gray-50",
  card: "bg-gradient-to-b from-white to-gray-50/50",
  greenSubtle: "bg-gradient-to-br from-agri-50 to-agri-100",
  accentSubtle: "bg-gradient-to-br from-white to-agri-50",
};

// Configuration standardisée des widgets
export const widgetStyles = {
  container: `${roundings.lg} ${shadows.md} bg-white border overflow-hidden`,
  header: `p-4 border-b ${typography.heading3}`,
  body: "p-4",
  hover: "hover:shadow-lg transition-shadow duration-300",
};

// Utilitaires de style
export function combineStyles(...styles: string[]): string {
  return styles.filter(Boolean).join(" ");
}

// Standards pour les tableaux
export const tableStyles = {
  container: "w-full overflow-auto",
  table: "w-full text-sm",
  header: "text-xs uppercase text-muted-foreground font-medium",
  row: "border-b hover:bg-muted/50 transition-colors",
  cell: "p-3",
};

// Standards pour les arrière-plans spéciaux
export const backgrounds = {
  subtle: "bg-muted/30", 
  accent: "bg-accent/10",
  primary: "bg-primary/10",
  cardGradient: "bg-gradient-to-b from-white to-gray-50/50",
};
