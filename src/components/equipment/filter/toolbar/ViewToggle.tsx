
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, setCurrentView }) => {
  // Load saved view preference on component mount
  useEffect(() => {
    const savedView = localStorage.getItem('equipmentViewPreference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setCurrentView(savedView);
    }
  }, [setCurrentView]);

  // Handle view toggle and save preference
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('equipmentViewPreference', view);
  };

  return (
    <div className="flex">
      <Button
        variant={currentView === 'grid' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleViewChange('grid')}
        className="rounded-r-none"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Vue en grille</span>
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => handleViewChange('list')}
        className="rounded-l-none"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Vue en liste</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
