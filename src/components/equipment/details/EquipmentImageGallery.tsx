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
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useEquipmentPhotos } from '@/hooks/equipment/useEquipmentPhotos';

interface EquipmentImageGalleryProps {
  equipment: EquipmentItem;
}

const EquipmentImageGallery: React.FC<EquipmentImageGalleryProps> = ({ equipment }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { photos, loading } = useEquipmentPhotos(equipment.id);
  
  useEffect(() => {
    const equipmentImages: string[] = [];
    
    // Utiliser les photos de la table equipment_photos
    if (photos && photos.length > 0) {
      // Trier par is_primary d'abord, puis par display_order
      const sortedPhotos = [...photos].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.display_order - b.display_order;
      });
      
      sortedPhotos.forEach(photo => equipmentImages.push(photo.photo_url));
    } else if (equipment.image && equipment.image !== 'nul') {
      // Fallback sur l'ancienne image unique
      equipmentImages.push(equipment.image);
    }
    
    // Image par défaut si aucune photo
    if (equipmentImages.length === 0) {
      equipmentImages.push("https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop");
    }
    
    setImages(equipmentImages);
    setCurrentIndex(0);
  }, [equipment, photos]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 md:p-6 pb-2">
        <CardTitle className="text-base md:text-lg font-medium text-center md:text-left">Images</CardTitle>
        <CardDescription className="text-center md:text-left">Photos de l'équipement</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg bg-muted">
          <AspectRatio ratio={4 / 3}>
            <img
              src={images[currentIndex]}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={() => setIsZoomOpen(true)}
            />
            {images.length > 1 && (
              <>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={() => setIsZoomOpen(true)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </AspectRatio>
        </div>

        {images.length > 1 && (
          <div className="flex justify-center space-x-1 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center">{equipment.name}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full overflow-hidden rounded-lg">
            <img
              src={images[currentIndex]}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="w-full h-full object-contain max-h-[70vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EquipmentImageGallery;
