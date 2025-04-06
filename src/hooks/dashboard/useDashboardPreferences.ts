
import { useState, useEffect } from 'react';

// Types pour les préférences du tableau de bord
export interface DashboardSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  size: number; // Taille relative (1-12 en grille)
  minWidth?: number; // Largeur minimale en pixels pour le desktop
  minHeight?: number; // Hauteur minimale en pixels
  collapsible?: boolean; // Si la section peut être minimisée/maximisée
  collapsed?: boolean; // État de la section (minimisée ou non)
}

// Interface pour l'état complet des préférences
export interface DashboardPreferences {
  layout: 'grid' | 'list' | 'compact';
  sections: Record<string, DashboardSection>;
  columnCount: 1 | 2 | 3 | 4;
  enableResizing?: boolean; // Activer le redimensionnement des sections
  enableMobileOptimizations?: boolean; // Optimisations spécifiques pour mobile
  enableDragAndDrop?: boolean; // Activer le déplacement des sections
}

// Préférences par défaut
const defaultPreferences: DashboardPreferences = {
  layout: 'grid',
  columnCount: 3,
  enableResizing: true,
  enableMobileOptimizations: true,
  enableDragAndDrop: true,
  sections: {
    'equipment': { 
      id: 'equipment', 
      title: 'Équipement', 
      visible: true, 
      order: 0, 
      size: 8,
      minWidth: 300,
      minHeight: 200,
      collapsible: true,
      collapsed: false
    },
    'urgent-interventions': { 
      id: 'urgent-interventions', 
      title: 'Interventions urgentes', 
      visible: true, 
      order: 1, 
      size: 8,
      minWidth: 300,
      minHeight: 250,
      collapsible: true,
      collapsed: false
    },
    'weekly-calendar': { 
      id: 'weekly-calendar', 
      title: 'Calendrier de la semaine', 
      visible: true, 
      order: 2, 
      size: 8,
      minWidth: 400,
      minHeight: 300,
      collapsible: true,
      collapsed: false
    },
    'alerts': { 
      id: 'alerts', 
      title: 'Alertes', 
      visible: true, 
      order: 3, 
      size: 4,
      minWidth: 250,
      minHeight: 200,
      collapsible: true,
      collapsed: false
    },
    'stock': { 
      id: 'stock', 
      title: 'Stock faible', 
      visible: true, 
      order: 4, 
      size: 4,
      minWidth: 250,
      minHeight: 200,
      collapsible: true,
      collapsed: false
    },
    'tasks': { 
      id: 'tasks', 
      title: 'Tâches', 
      visible: true, 
      order: 5, 
      size: 4,
      minWidth: 250,
      minHeight: 200,
      collapsible: true,
      collapsed: false
    }
  }
};

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les préférences depuis le stockage local au montage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('dashboardPreferences');
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences du tableau de bord:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Sauvegarder les préférences dans le stockage local lorsqu'elles changent
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('dashboardPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des préférences du tableau de bord:', error);
      }
    }
  }, [preferences, isLoading]);

  // Mise à jour de la visibilité d'une section
  const toggleSectionVisibility = (sectionId: string) => {
    setPreferences(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          visible: !prev.sections[sectionId].visible
        }
      }
    }));
  };
  
  // Basculer l'état minimisé/maximisé d'une section
  const toggleSectionCollapse = (sectionId: string) => {
    setPreferences(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          collapsed: !prev.sections[sectionId].collapsed
        }
      }
    }));
  };

  // Modifier l'ordre d'une section
  const updateSectionOrder = (sections: Record<string, DashboardSection>) => {
    setPreferences(prev => ({
      ...prev,
      sections
    }));
  };

  // Modifier la taille d'une section
  const updateSectionSize = (sectionId: string, size: number) => {
    setPreferences(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          size: Math.min(Math.max(1, size), 12) // Limiter entre 1 et 12
        }
      }
    }));
  };

  // Changer la disposition
  const updateLayout = (layout: 'grid' | 'list' | 'compact') => {
    setPreferences(prev => ({
      ...prev,
      layout
    }));
  };

  // Changer le nombre de colonnes
  const updateColumnCount = (count: 1 | 2 | 3 | 4) => {
    setPreferences(prev => ({
      ...prev,
      columnCount: count
    }));
  };

  // Activer/désactiver les fonctionnalités
  const toggleFeature = (feature: 'enableResizing' | 'enableMobileOptimizations' | 'enableDragAndDrop') => {
    setPreferences(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  // Réinitialiser les préférences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  // Obtenir les sections triées par ordre
  const getSortedSections = () => {
    return Object.values(preferences.sections)
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
  };

  return {
    preferences,
    isEditing,
    setIsEditing,
    isLoading,
    toggleSectionVisibility,
    toggleSectionCollapse,
    updateSectionOrder,
    updateSectionSize,
    updateLayout,
    updateColumnCount,
    toggleFeature,
    resetPreferences,
    getSortedSections
  };
}
