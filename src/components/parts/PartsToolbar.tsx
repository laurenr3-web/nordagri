
import React, { useEffect } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

interface PartsToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  openFilterDialog: () => void;
  openSortDialog: () => void;
  filterCount: number;
}

const PartsToolbar: React.FC<PartsToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView,
  openFilterDialog,
  openSortDialog,
  filterCount
}) => {
  // Load saved view preference on component mount
  useEffect(() => {
    const savedView = localStorage.getItem('partsViewPreference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setCurrentView(savedView);
    }
  }, [setCurrentView]);

  // Handle view toggle and save preference
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('partsViewPreference', view);
  };

  return (
    <BlurContainer className="p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search part name, number, manufacturer..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            size="sm"
            onClick={openFilterDialog}
          >
            <Filter size={16} />
            <span>Filter</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {filterCount}
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            size="sm"
            onClick={openSortDialog}
          >
            <SlidersHorizontal size={16} />
            <span>Sort</span>
          </Button>
          <Button variant="outline" size="icon" className={currentView === 'grid' ? 'bg-secondary' : ''} onClick={() => handleViewChange('grid')}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H6.5V6.5H2V2ZM2 8.5H6.5V13H2V8.5ZM8.5 2H13V6.5H8.5V2ZM8.5 8.5H13V13H8.5V8.5Z" fill="currentColor"/>
            </svg>
          </Button>
          <Button variant="outline" size="icon" className={currentView === 'list' ? 'bg-secondary' : ''} onClick={() => handleViewChange('list')}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3H13V5H2V3ZM2 7H13V9H2V7ZM2 11H13V13H2V11Z" fill="currentColor"/>
            </svg>
          </Button>
        </div>
      </div>
    </BlurContainer>
  );
};

export default PartsToolbar;
