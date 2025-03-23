
import React from 'react';

interface ImagePreviewProps {
  imageUrl: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="mt-2 relative bg-muted rounded-md overflow-hidden w-full">
      <div className="aspect-square w-full max-w-xs mx-auto">
        <img
          src={imageUrl}
          alt="Equipment preview"
          className="object-contain w-full h-full p-2"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
            e.currentTarget.classList.add('bg-muted-foreground/10');
          }}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
