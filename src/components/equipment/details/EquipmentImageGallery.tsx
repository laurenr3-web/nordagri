
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, Upload, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageService, ImageMetadata } from '@/services/imageService';
import { ImageQualityIndicator } from '../images/ImageQualityIndicator';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface EquipmentImageGalleryProps {
  equipment: EquipmentItem;
}

const EquipmentImageGallery: React.FC<EquipmentImageGalleryProps> = ({ equipment }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<Map<string, ImageMetadata>>(new Map());
  const [loadingMetadata, setLoadingMetadata] = useState<Set<string>>(new Set());
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  useEffect(() => {
    const equipmentImages = [];
    
    // Image principale
    if (equipment.image && equipment.image !== 'nul') {
      equipmentImages.push(equipment.image);
    }
    
    // Images supplémentaires (si disponibles dans le futur)
    // Note: Pour l'instant, on utilise juste l'image principale
    // Mais la structure est prête pour plusieurs images
    
    // Image par défaut si aucune image
    if (equipmentImages.length === 0) {
      equipmentImages.push("https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop");
    }
    
    setImages(equipmentImages);
    setCurrentIndex(0);
    
    // Charger les métadonnées pour chaque image
    equipmentImages.forEach(loadImageMetadata);
  }, [equipment]);

  const loadImageMetadata = async (imageUrl: string) => {
    if (imageMetadata.has(imageUrl) || loadingMetadata.has(imageUrl)) return;
    
    setLoadingMetadata(prev => new Set(prev).add(imageUrl));
    
    try {
      const metadata = await ImageService.loadImageWithRetry(imageUrl, {
        maxRetries: 1,
        baseDelay: 500
      });
      
      setImageMetadata(prev => new Map(prev).set(imageUrl, metadata));
    } catch (error) {
      console.error('Failed to load image metadata:', error);
    } finally {
      setLoadingMetadata(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageUrl);
        return newSet;
      });
    }
  };

  const currentImage = images[currentIndex];
  const currentMetadata = currentImage ? imageMetadata.get(currentImage) : undefined;

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageUpload = () => {
    // Placeholder pour future fonctionnalité d'upload
    console.log('Upload image functionality to be implemented');
  };

  const exportImages = () => {
    // Placeholder pour export des images
    console.log('Export images functionality to be implemented');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 md:p-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base md:text-lg font-medium">Images</CardTitle>
            <CardDescription>
              {images.length} photo{images.length > 1 ? 's' : ''} disponible{images.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImageUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter une photo
              </DropdownMenuItem>
              {images.length > 1 && (
                <DropdownMenuItem onClick={exportImages}>
                  <ZoomIn className="h-4 w-4 mr-2" />
                  Exporter les photos
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Image principale */}
        <div className="relative w-full overflow-hidden rounded-lg bg-muted">
          <AspectRatio ratio={4 / 3}>
            <img
              src={currentImage}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={() => setIsZoomOpen(true)}
            />
            
            {/* Navigation pour multiple images */}
            {images.length > 1 && (
              <>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Bouton zoom */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={() => setIsZoomOpen(true)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            {/* Indicateur de qualité */}
            {currentMetadata && (
              <div className="absolute top-2 left-2">
                <ImageQualityIndicator metadata={currentMetadata} compact />
              </div>
            )}
            
            {/* Compteur d'images */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Miniatures pour navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-colors",
                  index === currentIndex 
                    ? "border-primary" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Métadonnées de l'image courante */}
        {currentMetadata && (
          <div className="pt-2 border-t">
            <ImageQualityIndicator metadata={currentMetadata} />
          </div>
        )}

        {/* Indicateurs de position pour images multiples */}
        {images.length > 1 && (
          <div className="flex justify-center space-x-1 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Modal de zoom */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center">
              {equipment.name} - Image {currentIndex + 1} / {images.length}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full overflow-hidden rounded-lg">
            <img
              src={currentImage}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="w-full h-full object-contain max-h-[70vh]"
            />
            
            {/* Navigation dans le modal */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button variant="outline" onClick={goToNext}>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Métadonnées dans le modal */}
          {currentMetadata && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <ImageQualityIndicator metadata={currentMetadata} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EquipmentImageGallery;
