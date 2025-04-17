
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EquipmentImageGalleryProps {
  equipment: EquipmentItem;
}

const EquipmentImageGallery: React.FC<EquipmentImageGalleryProps> = ({ equipment }) => {
  // Initialiser les images avec l'image fournie par l'équipement
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Mettre à jour les images lorsque l'équipement change
  useEffect(() => {
    const equipmentImages = [];
    
    // Ajouter l'image principale de l'équipement si elle existe
    if (equipment.image && equipment.image !== 'nul') {
      equipmentImages.push(equipment.image);
    }
    
    // Ajouter une image par défaut si aucune image n'est disponible
    if (equipmentImages.length === 0) {
      equipmentImages.push("https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop");
    }
    
    setImages(equipmentImages);
    setCurrentIndex(0); // Reset to first image when equipment changes
  }, [equipment]);
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };
  
  const handleZoom = () => {
    setIsZoomOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className={isMobile ? "pb-2 px-4 py-3" : "pb-3"}>
          <CardTitle className="text-lg font-medium">Images</CardTitle>
          <CardDescription>Photos de l'équipement</CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-4 py-2" : ""}>
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img
              src={images[currentIndex]}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={handleZoom}
            />
            {images.length > 1 && (
              <>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={handleZoom}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        {images.length > 1 && (
          <CardFooter className="flex justify-center py-2">
            <div className="flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Zoom Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{equipment.name}</DialogTitle>
          </DialogHeader>
          <div className="w-full max-h-[70vh] overflow-hidden rounded-md">
            <img
              src={images[currentIndex]}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="w-full h-auto object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédente
              </Button>
              <div className="text-center">
                Image {currentIndex + 1} sur {images.length}
              </div>
              <Button
                variant="outline"
                onClick={() => navigateImage('next')}
              >
                Suivante
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentImageGallery;
