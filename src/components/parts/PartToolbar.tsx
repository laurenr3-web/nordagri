
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Search, UploadCloud } from 'lucide-react';

interface PartToolbarProps {
  onPhotoClick: () => void;
}

const PartToolbar: React.FC<PartToolbarProps> = ({ onPhotoClick }) => {
  return (
    <div className="flex items-center justify-between mb-4 bg-card p-2 rounded-lg shadow-sm">
      <div className="text-lg font-medium">Recherche de pièces</div>
      <div className="flex gap-2">
        <Button 
          variant="default" 
          size="sm"
          onClick={onPhotoClick}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Photo</span>
        </Button>
      </div>
    </div>
  );
};

export default PartToolbar;
