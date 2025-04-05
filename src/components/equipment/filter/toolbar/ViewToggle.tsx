
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

interface ViewToggleProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, setCurrentView }) => {
  // Handle view toggle and save preference with error handling
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    try {
      localStorage.setItem('equipmentViewPreference', view);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la préférence d\'affichage:', error);
      toast.error('Impossible de sauvegarder votre préférence d\'affichage');
    }
  };

  return (
    <div className="flex">
      <Button
        variant={currentView === 'grid' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleViewChange('grid')}
        className="rounded-r-none"
        aria-label="Vue en grille"
        title="Vue en grille"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Vue en grille</span>
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleViewChange('list')}
        className="rounded-l-none"
        aria-label="Vue en liste"
        title="Vue en liste"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Vue en liste</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
