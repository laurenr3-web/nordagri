
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ImagePreviewProps {
  imageUrl?: string;
  onReset: () => void;
  altText?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageUrl, 
  onReset,
  altText = "Preview image" 
}) => {
  if (!imageUrl) return null;

  // Gestionnaire d'erreur amélioré
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://placehold.co/400x300/png?text=No+Image';
    toast.error("Impossible de charger l'image", {
      description: "L'URL fournie n'est pas valide ou l'image n'est pas accessible"
    });
  };

  return (
    <div className="relative bg-muted rounded-md overflow-hidden mt-2">
      <div className="aspect-video w-full max-w-md mx-auto">
        <img
          src={imageUrl}
          alt={altText}
          className="object-cover w-full h-full"
          onError={handleImageError}
        />
      </div>
      <Button 
        type="button" 
        size="icon" 
        variant="destructive" 
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onReset}
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ImagePreview;
