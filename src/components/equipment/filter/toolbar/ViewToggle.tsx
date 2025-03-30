
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="flex">
      <Button
        variant={currentView === 'grid' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setCurrentView('grid')}
        className="rounded-r-none"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Vue en grille</span>
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setCurrentView('list')}
        className="rounded-l-none"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Vue en liste</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
