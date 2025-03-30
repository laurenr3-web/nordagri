
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertCircle } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string | undefined;
  onReset: () => void;
  altText?: string;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  onReset,
  altText = "Aperçu de l'image",
  className = ""
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser l'état d'erreur lorsque l'URL change
  useEffect(() => {
    setError(false);
    setIsLoading(!!imageUrl);
  }, [imageUrl]);

  // Gérer le chargement et les erreurs d'image
  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Ne rien afficher si pas d'URL
  if (!imageUrl) {
    return null;
  }

  return (
    <div className={`relative border rounded-md overflow-hidden ${className}`}>
      <div className="aspect-video relative bg-muted/20">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 p-4">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-center text-muted-foreground">
              Impossible de charger l'image. Vérifiez l'URL ou essayez une autre image.
            </p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={altText}
            className="object-cover w-full h-full"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
        
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onReset}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer l'image</span>
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
