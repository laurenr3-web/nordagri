
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl?: string;
  onReset: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onReset }) => {
  if (!imageUrl) return null;

  return (
    <div className="relative bg-muted rounded-md overflow-hidden">
      <div className="aspect-video w-full max-w-md mx-auto">
        <img
          src={imageUrl}
          alt="Equipment preview"
          className="object-cover w-full h-full"
        />
      </div>
      <Button 
        type="button" 
        size="icon" 
        variant="destructive" 
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onReset}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ImagePreview;
