
import React from 'react';

interface InterventionsNavigationProps {
  setCurrentView: (view: string) => void;
  currentView: string;
}

// Ce composant a été simplifié et n'affiche plus les grosses cartes de navigation
const InterventionsNavigation: React.FC<InterventionsNavigationProps> = () => {
  // Ce composant est maintenant vide car nous utilisons directement les onglets
  // Les fonctionnalités de navigation ont été déplacées vers InterventionsList
  return null;
};

export default InterventionsNavigation;
