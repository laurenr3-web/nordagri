
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  imageUrl: string;
  onReset?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onReset }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="mt-2 relative bg-muted rounded-md overflow-hidden w-full">
      <div className="aspect-square w-full max-w-xs mx-auto relative">
        <img
          src={imageUrl}
          alt="Equipment preview"
          className="object-contain w-full h-full p-2"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
            e.currentTarget.classList.add('bg-muted-foreground/10');
          }}
        />
        
        {onReset && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Changer l'image</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
